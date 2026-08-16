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
 *
 * Модель взаимодействия (намеренно простая, без touch-хаков):
 *   — Устройства с ховером (мышь): наведение показывает, уход прячет.
 *     Клавиатура: focus/blur. Определяется через matchMedia('(hover:hover)'),
 *     а НЕ по ширине окна — планшеты и узкие окна не путаются.
 *   — Устройства без ховера (тач): обычный click по слову (браузер сам шлёт
 *     его после тапа — никаких touchstart/preventDefault и подавления
 *     синтетических кликов не нужно).
 *   — Раскладка (шторка снизу vs поповер у слова) — по ширине, в согласии
 *     с CSS-брейкпоинтом 768px.
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

    /* ─── Глава 3 ─── */
    'span-cbam':
      'CBAM (Carbon Border Adjustment Mechanism) — трансграничный ' +
      'корректирующий углеродный механизм Европейского союза, по сути ' +
      'являющийся углеродным налогом на импорт.',
  };

  const MOBILE_BREAKPOINT = 768;

  // Раскладка: шторка или поповер. Должно совпадать с медиазапросом в CSS.
  const isSheetLayout = () => window.innerWidth <= MOBILE_BREAKPOINT;

  // Способ ввода: есть ли «настоящий» ховер. matchMedia живой — если к
  // планшету подключили мышь, .matches обновится сам.
  const hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
  const canHover = () => hoverMq.matches;

  let box, activeEl = null;
  let closeTimer = null;        // таймер закрытия шторки — ВСЕГДА отменяем при show()

  /* ─── Создаём общий контейнер тултипа один раз ───
   * На мобильной раскладке это нативный <dialog> в модальном режиме:
   * showModal() сам блокирует фон (страница не скроллится, адресная строка
   * не дёргается), держит шторку поверх вьюпорта, даёт ::backdrop и Escape.
   */
  function ensureNodes() {
    box = document.getElementById('tooltip-global');
    // Защита: если в HTML остался старый статический <div id="tooltip-global">,
    // у него нет show()/showModal() и open — тултип молча не работал бы.
    // Сносим и создаём настоящий <dialog>.
    if (box && box.tagName !== 'DIALOG') {
      box.remove();
      box = null;
    }
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
    // Если шторка ещё доигрывает анимацию закрытия — отменяем, иначе отложенный
    // close() схлопнет только что открытый тултип (это и был главный глюк).
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

    // Убираем висячие предлоги и в самом тексте подсказки (функция из
    // no-hanging-prepositions.js). Если файл не подключён — показываем как есть.
    box.textContent = (typeof window.fixHangingText === 'function')
      ? window.fixHangingText(text)
      : text;

    if (activeEl && activeEl !== el) {
      activeEl.classList.remove('term-tooltip--active');
      activeEl.setAttribute('aria-expanded', 'false');
    }
    activeEl = el;
    el.classList.add('term-tooltip--active');
    el.setAttribute('aria-expanded', 'true');

    if (isSheetLayout()) {
      box.classList.add('tooltip--mobile');
      // iOS Safari умеет прокручивать страницу ПОД модальным <dialog> —
      // от прокрутки прячется/появляется нижний тулбар браузера, высота
      // вьюпорта меняется и шторка «скачет». Блокируем скролл фона лёгким
      // overflow:hidden (НЕ position:fixed-лок — тот сам давал скачки).
      // Снимается в обработчике 'close' — единственной точке закрытия.
      document.documentElement.classList.add('tooltip-lock');
      // showModal() сам блокирует фон и держит шторку поверх вьюпорта.
      // Защита от повторного вызова (иначе showModal бросает исключение).
      if (!box.open) box.showModal();
      // двойной rAF — чтобы сработала transition-анимация шторки
      requestAnimationFrame(() => requestAnimationFrame(() => {
        box.classList.add('is-visible');
      }));
    } else {
      // Десктоп: немодальный поповер у слова. show() (не showModal) НЕ блокирует
      // фон и не рисует backdrop. Если осталась открытая модалка — закрываем.
      if (box.open) box.close();
      box.classList.remove('tooltip--mobile', 'is-visible');
      box.show();
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
      // Таймер запоминаем: show() обязан его отменить при повторном открытии.
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        closeTimer = null;
        if (box.open) box.close();
        box.classList.remove('tooltip--mobile');
      }, 250);
    } else {
      // Десктоп: закрываем немодальный диалог → уходит [open] → display:none.
      if (box.open) box.close();
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

      // Мышь: наведение. Только на устройствах с настоящим ховером —
      // эмулированные mouseenter после тапа сюда не пройдут.
      el.addEventListener('mouseenter', () => { if (canHover()) show(text, el); });
      el.addEventListener('mouseleave', () => { if (canHover()) hide(); });

      // Клавиатура (доступность). Только при наличии ховера: на таче
      // showModal() переносит фокус в диалог → blur у слова закрывал бы
      // тултип сразу после открытия.
      el.addEventListener('focus', () => { if (canHover()) show(text, el); });
      el.addEventListener('blur',  () => { if (canHover()) hide(); });

      // Тач (и вообще клик на устройствах без ховера): браузер надёжно шлёт
      // обычный click после тапа. Никаких touchstart/preventDefault —
      // скролл, начатый на слове, работает как обычно.
      el.addEventListener('click', e => {
        if (canHover()) return;               // на десктопе всё делает ховер
        e.preventDefault();                   // на случай вложенности в <a>
        if (activeEl === el && box.open && !closeTimer) hide();
        else show(text, el);
      });
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

    // Escape в модальном режиме: нативное событие cancel. Перехватываем,
    // чтобы закрыть со своей анимацией и не рассинхронизировать классы.
    box.addEventListener('cancel', e => {
      e.preventDefault();
      hide();
    });

    // Нативное закрытие <dialog> (программное close) — синхронизируем
    // классы и состояние слова, чтобы не рассинхронизировалось с hide().
    box.addEventListener('close', () => {
      document.documentElement.classList.remove('tooltip-lock');
      box.classList.remove('tooltip--mobile', 'is-visible');
      if (activeEl) {
        activeEl.classList.remove('term-tooltip--active');
        activeEl.setAttribute('aria-expanded', 'false');
        activeEl = null;
      }
    });

    // Клик/тап вне слова и тултипа закрывает. В модальном режиме фон inert,
    // клики туда не доходят — там закрытие делает обработчик backdrop выше.
    document.addEventListener('click', e => {
      if (e.target.closest('.term-tooltip') || e.target.closest('#tooltip-global')) return;
      hide();
    });

    // Escape закрывает десктопный поповер (модалку закрывает cancel выше)
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });

    // При смене ориентации/ширины прячем, чтобы не зависало между режимами.
    // ВАЖНО: реагируем только на смену ШИРИНЫ. Высота вьюпорта на мобилке
    // постоянно меняется (адресная строка) — на это закрываться нельзя.
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
