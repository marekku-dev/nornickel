/**
 * components.js
 * Загрузчик shared-компонентов (header, footer) для всех глав.
 *
 * Использование в HTML:
 *   <div data-component="header"></div>
 *   <div data-component="footer"></div>
 *   <script src="js/components.js"></script>
 *
 * После загрузки компонента запускает его инициализацию (progress bar, nav, fade-in).
 */

(function () {
  'use strict';

  /* ─── Путь к папке с компонентами ─── */
  const BASE = 'components/';

  /* ─── Загрузить один компонент в слот ─── */
  async function loadComponent(slot) {
    const name = slot.dataset.component;
    if (!name) return;
    try {
      const res  = await fetch(BASE + name + '.html');
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();
      slot.outerHTML = html;          // заменяем слот настоящей разметкой
    } catch (e) {
      console.warn('[components.js] Не удалось загрузить:', name, e);
    }
  }

  /* ─── Загрузить все слоты на странице ─── */
  async function loadAll() {
    const slots = document.querySelectorAll('[data-component]');
    await Promise.all(Array.from(slots).map(loadComponent));
    initAll();   // инициализируем логику после вставки HTML
  }

  /* ─── Инициализация всей интерактивности ─── */
  function initAll() {
    initProgressBar();
    initChaptersNav();
    initActiveChapter();
    initReveal();
    initHorizontalScroll();
    // Убираем висячие предлоги во всём документе (включая вставленные
    // компоненты header/footer). Функция из no-hanging-prepositions.js.
    if (typeof window.fixHangingPrepositions === 'function') {
      window.fixHangingPrepositions();
    }
    // Единые тултипы к терминам (.term-tooltip). Функция из tooltips.js.
    if (typeof window.initTooltips === 'function') {
      window.initTooltips();
    }
  }

  /* ─── Горизонтальный скролл на тач-устройствах ─── */
  /*
   * Android Chrome блокирует горизонтальный скролл дочернего элемента,
   * пока страница в движении. Обходим это: отслеживаем направление свайпа
   * и вручную скроллим контейнер если жест горизонтальный.
   */
  function initHorizontalScroll() {
    document.querySelectorAll('.graph-scroll').forEach(el => {
      let startX, startY, startScrollLeft;

      el.addEventListener('touchstart', e => {
        startX          = e.touches[0].clientX;
        startY          = e.touches[0].clientY;
        startScrollLeft = el.scrollLeft;
      }, { passive: true });

      el.addEventListener('touchmove', e => {
        if (startX === undefined) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        // Если жест горизонтальнее — скроллим сами и блокируем страницу
        if (Math.abs(dx) > Math.abs(dy)) {
          e.preventDefault();
          el.scrollLeft = startScrollLeft - dx;
          // Прячем подсказку после первого свайпа
          el.classList.add('scrolled');
        }
      }, { passive: false });
    });
  }

  /* ─── Прогресс-бар скролла + цвет шапки ─── */
  function initProgressBar() {
    const bar      = document.getElementById('scroll-progress');
    const header   = document.querySelector('.site-header');
    /* Молочные (светлые) секции, над которыми текст шапки должен быть чёрным */
    const lightEls = document.querySelectorAll('.content');

    function update() {
      if (bar) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) bar.style.width = (window.scrollY / total * 100) + '%';
      }
      if (header) {
        /* Точка проверки — середина высоты шапки */
        const probe = header.offsetHeight / 2;
        let overLight = false;
        lightEls.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top <= probe && r.bottom >= probe) overLight = true;
        });
        header.classList.toggle('site-header--dark', overLight);
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ─── Меню глав ─── */
  function initChaptersNav() {
    const toggle = document.getElementById('chapters-toggle');
    const menu   = document.getElementById('chapters-menu');
    if (!toggle || !menu) return;

    const btn = toggle.querySelector('.nav-chapters__toggle');

    toggle.addEventListener('click', (e) => {
      const isOpen = !menu.hidden;
      menu.hidden = isOpen;
      btn && btn.setAttribute('aria-expanded', String(!isOpen));
      e.stopPropagation();
    });

    document.addEventListener('click', () => {
      menu.hidden = true;
      btn && btn.setAttribute('aria-expanded', 'false');
    });
  }

  /* ─── Активная глава в меню ─── */
  function initActiveChapter() {
    const currentPage = location.pathname.split('/').pop() || 'chapter-1.html';
    document.querySelectorAll('.nav-chapters__item').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPage || href.endsWith(currentPage))) {
        link.classList.add('nav-chapters__item--active');
      }
    });
  }

  /* ─── Fade-in секций при скролле ─── */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal--visible');
          obs.unobserve(e.target);   // срабатывает только один раз
        }
      });
    }, { threshold: 0.08 });

    targets.forEach(el => obs.observe(el));
  }

  /* ─── Универсальный drag-follow свайп для слайдеров ───
   *
   * Карточка тянется за пальцем в реальном времени, на отпускании
   * плавно доводится до соседнего слайда. Зона свайпа — весь блок
   * (обычно враппер во всю ширину), а не узкий трек.
   *
   * opts = {
   *   area,      // элемент, на котором ловим тач (вся активная зона)
   *   track,     // элемент, который двигаем (transform: translateX)
   *   getCurrent,// () => индекс текущего слайда
   *   getTotal,  // () => всего слайдов
   *   step,      // () => ширина одного шага в px (ширина видимой области)
   *   onPrev,    // () => перейти на предыдущий слайд (может быть циклическим)
   *   onNext,    // () => перейти на следующий слайд
   *   render,    // () => вернуть трек на позицию текущего слайда (с transition)
   *   loop       // bool: цикличный ли слайдер (тогда нет сопротивления на краях)
   * }
   */
  function attachSwipe(opts) {
    const { area, track } = opts;
    if (!area || !track) return;

    let startX = 0, startY = 0, dragDX = 0, dragging = false, decided = false;

    function onStart(e) {
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX; startY = t.clientY;
      dragDX = 0; dragging = false; decided = false;
      track.style.transition = 'none';
    }

    function onMove(e) {
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!decided) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        decided  = true;
        dragging = Math.abs(dx) > Math.abs(dy); // горизонталь → наш свайп
      }
      if (!dragging) return;
      e.preventDefault(); // блокируем вертикальный скролл во время свайпа

      const current = opts.getCurrent();
      const total   = opts.getTotal();
      let resist = dx;
      // Сопротивление на краях у нецикличных слайдеров
      if (!opts.loop && ((current === 0 && dx > 0) || (current === total - 1 && dx < 0))) {
        resist = dx * 0.35;
      }
      dragDX = resist;
      const base = current * opts.step();
      track.style.transform = `translateX(-${base - dragDX}px)`;
    }

    function onEnd() {
      track.style.transition = ''; // вернём CSS-transition (.4–.5s ease)
      if (dragging) {
        const threshold = opts.step() * 0.18;
        if (Math.abs(dragDX) > threshold) {
          (dragDX < 0 ? opts.onNext : opts.onPrev)();
        } else {
          opts.render(); // не дотянул — возвращаем на место
        }
      } else {
        opts.render();
      }
      dragging = false; decided = false; dragDX = 0;
    }

    area.addEventListener('touchstart',  onStart, { passive: true });
    area.addEventListener('touchmove',   onMove,  { passive: false });
    area.addEventListener('touchend',    onEnd,   { passive: true });
    area.addEventListener('touchcancel', onEnd,   { passive: true });
  }
  window.attachSwipe = attachSwipe;

  /* ─── Универсальный слайдер ───────────────────────────────────
   *
   * window.initSlider(id, opts)
   *
   * id   — базовый id: враппер="#id", трек="#id-mask", точки="#id-nav"
   * opts = {
   *   slideSelector,  // CSS-селектор слайдов внутри трека (default: '.slider__slide')
   *   stepMode,       // 'full'     — 100% ширины враппера  (default)
   *                   // 'item'     — ширина 1-го слайда + gap (10px)
   *                   // 'viewport' — ширина track.parentElement
   *   breakpoint,     // число: инициализировать только при window.innerWidth <= N
   *                   //        0 или не указано — всегда
   *   loop,           // bool (default: false)
   *   arrows,         // bool: генерировать кнопки «‹» «›» в JS (default: false)
   *                   // если false — кнопки берутся из HTML (onclick="slideChange(...)")
   *   dotLabel,       // строка для aria-label точки, напр. 'Карточка' (default: 'Слайд')
   * }
   *
   * Публичное API:
   *   window.slideChange(id, dir)   — переключить на dir шагов (±1)
   *   window.goToSlide(id, index)   — перейти на конкретный индекс
   * ────────────────────────────────────────────────────────────── */

  const _sliders = {};

  function initSlider(id, opts) {
    opts = opts || {};

    const breakpoint = opts.breakpoint || 0;
    if (breakpoint > 0 && window.innerWidth > breakpoint) return;

    const wrap  = document.getElementById(id);
    const track = document.getElementById(id + '-mask');
    if (!wrap || !track) return;

    const slideSelector = opts.slideSelector || '.slider__slide';
    const slides = Array.from(track.querySelectorAll(slideSelector));
    const total  = slides.length;
    if (!total) return;

    const nav       = document.getElementById(id + '-nav');
    const loop      = !!opts.loop;
    const stepMode  = opts.stepMode || 'full';
    const dotLabel  = opts.dotLabel || 'Слайд';

    // Функция шага в px
    function step() {
      if (stepMode === 'item') {
        return slides[0].getBoundingClientRect().width + 10;
      }
      if (stepMode === 'viewport') {
        const vp = track.parentElement;
        return (vp || slides[0]).getBoundingClientRect().width;
      }
      // 'full' — 100% враппера; render использует translateX(-N*100%)
      return wrap.getBoundingClientRect().width;
    }

    // Создаём точки
    if (nav) {
      nav.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider__dot' + (i === 0 ? ' slider__dot--active' : '');
        dot.type      = 'button';
        dot.setAttribute('aria-label', `${dotLabel} ${i + 1}`);
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', () => goToSlide(id, i));
        nav.appendChild(dot);
      });
    }

    // Генерируем стрелки, если нужно
    if (opts.arrows) {
      const prev = document.createElement('button');
      prev.className  = 'slider__arrow slider__arrow--prev';
      prev.type       = 'button';
      prev.setAttribute('aria-label', 'Предыдущий слайд');
      prev.innerHTML  = '<svg viewBox="0 0 24 24" width="24" height="24"><polyline points="15,6 9,12 15,18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
      prev.addEventListener('click', () => slideChange(id, -1));

      const next = document.createElement('button');
      next.className  = 'slider__arrow slider__arrow--next';
      next.type       = 'button';
      next.setAttribute('aria-label', 'Следующий слайд');
      next.innerHTML  = '<svg viewBox="0 0 24 24" width="24" height="24"><polyline points="9,6 15,12 9,18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
      next.addEventListener('click', () => slideChange(id, 1));

      wrap.appendChild(prev);
      wrap.appendChild(next);
    }

    _sliders[id] = { current: 0, total, loop, step, stepMode };
    _renderSlider(id);

    // Drag-follow свайп
    attachSwipe({
      area:       wrap,
      track:      track,
      getCurrent: () => _sliders[id].current,
      getTotal:   () => _sliders[id].total,
      step:       step,
      onPrev:     () => slideChange(id, -1),
      onNext:     () => slideChange(id,  1),
      render:     () => _renderSlider(id),
      loop:       loop
    });
  }

  function _renderSlider(id) {
    const s = _sliders[id];
    if (!s) return;

    const track = document.getElementById(id + '-mask');
    if (track) {
      if (s.stepMode === 'full') {
        track.style.transform = `translateX(-${s.current * 100}%)`;
      } else {
        track.style.transform = `translateX(-${s.current * s.step()}px)`;
      }
    }

    const nav = document.getElementById(id + '-nav');
    if (nav) {
      nav.querySelectorAll('.slider__dot').forEach((dot, i) => {
        dot.classList.toggle('slider__dot--active', i === s.current);
        dot.setAttribute('aria-selected', String(i === s.current));
      });
    }
  }

  function slideChange(id, dir) {
    const s = _sliders[id];
    if (!s) return;
    if (s.loop) {
      s.current = (s.current + dir + s.total) % s.total;
    } else {
      s.current = Math.max(0, Math.min(s.current + dir, s.total - 1));
    }
    _renderSlider(id);
  }

  function goToSlide(id, index) {
    const s = _sliders[id];
    if (!s) return;
    s.current = s.loop
      ? (index + s.total) % s.total
      : Math.max(0, Math.min(index, s.total - 1));
    _renderSlider(id);
  }

  window.initSlider   = initSlider;
  window.slideChange  = slideChange;
  window.goToSlide    = goToSlide;

  /* ─── Старт ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
