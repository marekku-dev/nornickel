/**
 * tooltips.js
 * Единый источник тултипов к терминам (.term-tooltip) для ВСЕХ глав.
 *
 * Как редактировать:
 *   1. Выдели слово в главе тегом
 *        <span id="span-СЛОВО" class="term-tooltip" tabindex="0">текст</span>
 *   2. Добавь это слово в объект TOOLTIPS ниже: ключ = id спана, значение = текст.
 *   Тултип сам появится в той главе, где есть спан с таким id. На страницах без
 *   этого id ничего не произойдёт — один файл обслуживает все главы.
 *
 * Подключение: вызывается из components.js → initAll() (initTooltips()).
 * Работает на десктопе (поповер у слова, наведение + клавиатура) и на мобильных
 * (нижняя шторка с затемнением, тап по слову / тап вне для закрытия).
 */
(function (global) {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
   *  ВСЕ ТУЛТИПЫ. Ключ — id спана, значение — текст подсказки.
   *  Сгруппированы по главам только для удобства чтения; технически
   *  это один общий объект.
   * ───────────────────────────────────────────────────────────── */
  const TOOLTIPS = {
    /* ─── Глава 1 ─── */
    'span-warming':
      'Определение МГЭИК — межправительственной группы экспертов по изменению климата.',

    /* ─── Глава 2 ─── */
    'span-albedo':
      'Альбедо — способность поверхности отражать свет, а не поглощать его. ' +
      'У снега высокое альбедо, он хорошо отражает солнечные лучи, ' +
      'а асфальт — низкое, поглощает большую часть света.',
    'span-arctic':
      'Национальный план 2 этапа адаптации. Распоряжение Правительства ' +
      'Российской Федерации от 11 марта 2023 г. № 559-р.',
  };

  const MOBILE_BREAKPOINT = 768;
  const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

  let box, activeEl = null;
  let touchedAt = 0;            // время последнего touchstart — гасим синтетический click

  /* ─── Создаём общий контейнер тултипа один раз ───
   * На мобильных это нативный <dialog>: он сам блокирует фон через showModal()
   * (page больше не скроллится, адресная строка не дёргается → нет «скачков»),
   * сам держит позицию поверх вьюпорта, даёт ::backdrop и закрытие по Escape.
   * Поэтому отдельный оверлей и ручная возня с visualViewport больше не нужны.
   */
  function ensureNodes() {
    box = document.getElementById('tooltip-global');
    if (!box) {
      box = document.createElement('dialog');
      box.id = 'tooltip-global';
      box.className = 'tooltip';
      box.setAttribute('role', 'tooltip');
      document.body.appendChild(box);
    }
  }

  /* ─── Позиционирование на десктопе: под словом, в границах контента ─── */
  function positionDesktop(el) {
    const r = el.getBoundingClientRect();
    // Границы по горизонтали — по контейнеру контента, иначе по окну
    const container = el.closest('.content, .outro__content, .hero__content');
    const cRect = container
      ? container.getBoundingClientRect()
      : { left: 10, right: window.innerWidth - 10 };

    box.style.bottom = 'auto';
    box.style.top = (r.bottom + 8) + 'px';   // position:fixed → координаты вьюпорта

    const boxW = box.offsetWidth;
    let left = r.left;
    if (left + boxW > cRect.right) left = cRect.right - boxW;
    if (left < cRect.left) left = cRect.left;
    if (left < 10) left = 10;                 // не вылезать за край экрана
    box.style.left = left + 'px';

    // Если не помещается снизу — показываем над словом
    const boxH = box.offsetHeight;
    if (r.bottom + 8 + boxH > window.innerHeight && r.top - 8 - boxH > 0) {
      box.style.top = (r.top - 8 - boxH) + 'px';
    }
  }

  function show(text, el) {
    if (!box) return;
    // Убираем висячие предлоги и в самом тексте подсказки (функция из
    // no-hanging-prepositions.js). Если файл не подключён — показываем как есть.
    box.textContent = (typeof window.fixHangingText === 'function')
      ? window.fixHangingText(text)
      : text;
    activeEl = el;
    el.classList.add('term-tooltip--active');
    el.setAttribute('aria-expanded', 'true');

    if (isMobile()) {
      box.classList.add('tooltip--mobile');
      // showModal() сам блокирует фон и центрирует поверх вьюпорта.
      // Защита от повторного открытия (иначе showModal бросает исключение).
      if (!box.open) box.showModal();
      // двойной rAF — чтобы сработала transition-анимация шторки
      requestAnimationFrame(() => requestAnimationFrame(() => {
        box.classList.add('is-visible');
      }));
    } else {
      // Десктоп: обычный поповер у слова. Если осталось открытое модальное
      // состояние от мобильной шторки — закрываем перед показом.
      if (box.open) box.close();
      box.classList.remove('tooltip--mobile', 'is-visible');
      box.style.display = 'block';
      positionDesktop(el);
    }
  }

  function hide() {
    if (!box) return;
    if (activeEl) {
      activeEl.classList.remove('term-tooltip--active');
      activeEl.setAttribute('aria-expanded', 'false');
      activeEl = null;
    }
    if (box.classList.contains('tooltip--mobile')) {
      box.classList.remove('is-visible');
      // Даём отыграть transition закрытия, потом закрываем <dialog>.
      setTimeout(() => {
        if (box.open) box.close();
        box.classList.remove('tooltip--mobile');
      }, 250);
    } else {
      box.style.display = 'none';
    }
  }

  /* ─── Привязка обработчиков ─── */
  function initTooltips() {
    ensureNodes();
    let bound = 0;

    for (const [id, text] of Object.entries(TOOLTIPS)) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.dataset.tooltipBound) continue;   // защита от повторной привязки
      el.dataset.tooltipBound = '1';
      el.setAttribute('aria-expanded', 'false');
      bound++;

      // Десктоп: наведение
      el.addEventListener('mouseenter', () => { if (!isMobile()) show(text, el); });
      el.addEventListener('mouseleave', () => { if (!isMobile()) hide(); });

      // Клавиатура (доступность)
      el.addEventListener('focus', () => show(text, el));
      el.addEventListener('blur',  hide);

      // Тач: тап по слову. preventDefault гасит синтетический click после touch.
      el.addEventListener('touchstart', e => {
        e.preventDefault();
        touchedAt = Date.now();   // пометка: ниже глобальный click это проигнорит
        // На мобилке открытость определяет атрибут open у <dialog>.
        const isOpen = box.open || box.style.display === 'block';
        if (activeEl === el && isOpen) hide();
        else show(text, el);
      }, { passive: false });
    }

    // Закрытие по тапу на затемнении (::backdrop) мобильной шторки.
    // Клик по самому <dialog> в модальном режиме приходит на элемент-диалог,
    // но если координаты вне его прямоугольника — значит попали в backdrop.
    box.addEventListener('click', e => {
      if (!box.classList.contains('tooltip--mobile')) return;
      const r = box.getBoundingClientRect();
      const outside = e.clientX < r.left || e.clientX > r.right ||
                      e.clientY < r.top  || e.clientY > r.bottom;
      if (outside) hide();
    });

    // Нативное закрытие <dialog> (Escape, программное close) — синхронизируем
    // классы и состояние слова, чтобы не рассинхронизировалось с hide().
    box.addEventListener('close', () => {
      box.classList.remove('tooltip--mobile', 'is-visible');
      if (activeEl) {
        activeEl.classList.remove('term-tooltip--active');
        activeEl.setAttribute('aria-expanded', 'false');
        activeEl = null;
      }
    });

    // Десктоп: клик вне тултипа закрывает.
    // Синтетический click после тача (в пределах ~500мс от touchstart) игнорируем —
    // тач уже обработан своим хендлером, иначе тултип схлопнется сразу после тапа.
    document.addEventListener('click', e => {
      if (Date.now() - touchedAt < 500) return;
      if (e.target.closest('.term-tooltip') || e.target.closest('#tooltip-global')) return;
      hide();
    });

    // Escape закрывает
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });

    // При смене ориентации/ширины прячем, чтобы не зависало между режимами.
    // ВАЖНО: реагируем только на смену ШИРИНЫ. Высота вьюпорта на мобилке
    // постоянно меняется (адресная строка, лок body) — на это закрываться нельзя,
    // иначе тултип схлопывается сразу после тапа.
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastWidth) return;   // изменилась только высота — игнор
      lastWidth = window.innerWidth;
      if (activeEl) hide();
    }, { passive: true });

    return bound;
  }

  global.initTooltips = initTooltips;

  /* Автозапуск, если файл подключили отдельным <script> без components.js */
  if (document.currentScript && !document.currentScript.dataset.manual) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTooltips);
    } else {
      initTooltips();
    }
  }
})(window);
