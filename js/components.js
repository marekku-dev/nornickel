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

  /* ─── Старт ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
