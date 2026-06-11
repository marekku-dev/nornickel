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

  /* ─── Старт ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
