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

  let box, overlay, activeEl = null;

  /* ─── Создаём общий контейнер тултипа и оверлей один раз ─── */
  function ensureNodes() {
    box = document.getElementById('tooltip-global');
    if (!box) {
      box = document.createElement('div');
      box.id = 'tooltip-global';
      box.className = 'tooltip';
      box.setAttribute('role', 'tooltip');
      document.body.appendChild(box);
    }
    overlay = document.getElementById('tooltip-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tooltip-overlay';
      document.body.appendChild(overlay);
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
    box.textContent = text;
    activeEl = el;
    el.classList.add('term-tooltip--active');
    el.setAttribute('aria-expanded', 'true');

    if (isMobile()) {
      box.classList.add('tooltip--mobile');
      box.style.display = 'block';
      overlay.classList.add('is-visible');
      // двойной rAF — чтобы сработала transition-анимация шторки
      requestAnimationFrame(() => requestAnimationFrame(() => {
        box.classList.add('is-visible');
      }));
    } else {
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
      overlay.classList.remove('is-visible');
      setTimeout(() => { box.style.display = 'none'; }, 250);
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

      // Тач: тап по слову. preventDefault гасит синтетический click после touch
      el.addEventListener('touchstart', e => {
        e.preventDefault();
        if (activeEl === el && box.style.display === 'block') hide();
        else show(text, el);
      }, { passive: false });
    }

    // Закрытие по тапу на затемнении (мобилка)
    overlay.addEventListener('touchstart', e => { e.preventDefault(); hide(); },
      { passive: false });
    overlay.addEventListener('click', hide);

    // Десктоп: клик вне тултипа закрывает
    document.addEventListener('click', e => {
      if (e.target.closest('.term-tooltip') || e.target.closest('#tooltip-global')) return;
      hide();
    });

    // Escape закрывает
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });

    // При ресайзе/смене ориентации прячем, чтобы не зависало между режимами
    window.addEventListener('resize', () => { if (activeEl) hide(); }, { passive: true });

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
