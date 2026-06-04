/**
 * chapter-5.js
 * Интерактивность страницы «Как мы можем замедлить изменение климата».
 *
 * Модули:
 *  1. ExpandingCards — раскрывающиеся карточки-аккордеон
 *  2. SliderInit     — инициализация слайдеров
 */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
   *  1. EXPANDING CARDS (аккордеон)
   * ════════════════════════════════════════════════════════════ */

  function initExpandingCards() {
    const cards = Array.from(document.querySelectorAll('.card-expanding'));
    if (!cards.length) return;

    cards.forEach(card => {
      const header = card.querySelector('.card-expanding__header');
      if (!header) return;

      header.addEventListener('click', () => {
        const isOpen = card.classList.contains('card-expanding--open');
        card.classList.toggle('card-expanding--open', !isOpen);
      });

      // Keyboard accessibility
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
   *  2. SLIDER (для мобильных карточек привычек)
   * ════════════════════════════════════════════════════════════ */

  // Глобальная функция для onclick в HTML
  window.slideChange = function (sliderId, direction) {
    const mask  = document.getElementById(sliderId + '-mask');
    const nav   = document.getElementById(sliderId + '-nav');
    if (!mask) return;

    const slides = mask.querySelectorAll('.slider__slide');
    const total  = slides.length;
    if (!total) return;

    let current = parseInt(mask.dataset.current || '0', 10);
    current = (current + direction + total) % total;
    mask.dataset.current = current;

    mask.style.transform = `translateX(-${current * 100}%)`;

    // Обновляем точки
    if (nav) {
      const dots = nav.querySelectorAll('.slider__dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('slider__dot--active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }
  };

  function initSliders() {
    const sliders = Array.from(document.querySelectorAll('.slider'));
    sliders.forEach(slider => {
      const sliderId = slider.id;
      if (!sliderId) return;

      const mask   = document.getElementById(sliderId + '-mask');
      const nav    = document.getElementById(sliderId + '-nav');
      if (!mask || !nav) return;

      const slides = mask.querySelectorAll('.slider__slide');
      mask.dataset.current = '0';

      // Создаём точки
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider__dot' + (i === 0 ? ' slider__dot--active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.setAttribute('aria-label', `Слайд ${i + 1}`);
        dot.addEventListener('click', () => {
          const current = parseInt(mask.dataset.current || '0', 10);
          window.slideChange(sliderId, i - current);
        });
        nav.appendChild(dot);
      });

      // Свайп на тачскрине
      let startX = 0;
      mask.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      mask.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) window.slideChange(sliderId, dx < 0 ? 1 : -1);
      }, { passive: true });
    });
  }

  /* ════════════════════════════════════════════════════════════
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initExpandingCards();
    initSliders();
  });

})();
