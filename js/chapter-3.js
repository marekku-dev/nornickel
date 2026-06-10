/**
 * chapter-3.js
 * Интерактивность страницы «Как изменение климата влияет на экономику».
 *
 * Модули:
 *  1. ExpandingCards — раскрывающиеся карточки-аккордеон
 *  2. FlipCards      — флип-карточки транспорта (touch-поддержка)
 *  3. CardSliders    — мобильный слайдер для cards-three-grid
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
   *  2. FLIP CARDS (тачскрин — flip по тапу)
   * ════════════════════════════════════════════════════════════ */

  function initFlipCards() {
    // Работаем только на устройствах без точного указателя (touch)
    const isTouchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!isTouchOnly) return;

    const cards = Array.from(document.querySelectorAll('.card-white:not(.card-white--no-flip)'));
    if (!cards.length) return;

    // Заменяем подсказку на тач-версию
    const hint = document.querySelector('.cards-white-hint');
    if (hint) {
      hint.classList.add('cards-white-hint--touch');
      hint.textContent = 'Нажмите на карточку';
    }

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const isFlipped = card.classList.contains('card-white--flipped');

        // Закрываем все остальные
        cards.forEach(c => c.classList.remove('card-white--flipped'));

        if (!isFlipped) {
          card.classList.add('card-white--flipped');
        }
      });
    });

    // Тап вне карточки — сбрасываем все
    document.addEventListener('click', e => {
      if (!e.target.closest('.card-white')) {
        cards.forEach(c => c.classList.remove('card-white--flipped'));
      }
    });
  }

  /* ════════════════════════════════════════════════════════════
   *  3. CARD SLIDERS (мобильный, только ≤767px)
   * ════════════════════════════════════════════════════════════ */

  function initCardSlider(id) {
    // Активируем только на мобильном
    if (window.innerWidth > 767) return;

    const wrapper = document.getElementById(id);
    const track   = document.getElementById(id + '-mask');
    const nav     = document.getElementById(id + '-nav');
    if (!wrapper || !track || !nav) return;

    const slides = Array.from(track.querySelectorAll('.cards-three-grid__slide'));
    const total  = slides.length;
    if (!total) return;

    let current = 0;

    // Создаём точки
    nav.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider__dot' + (i === 0 ? ' slider__dot--active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Карточка ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      nav.appendChild(dot);
    });

    function render() {
      // Каждый слайд: ширина + margin-left (20px)
      const slideWidth = slides[0].getBoundingClientRect().width + 10;
      const offset = current * slideWidth;
      track.style.transform = `translateX(-${offset}px)`;
      nav.querySelectorAll('.slider__dot').forEach((d, i) => {
        d.classList.toggle('slider__dot--active', i === current);
      });
    }

    function go(index) {
      current = Math.max(0, Math.min(index, total - 1));
      render();
    }

    // Свайп
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    render();
  }

  /* ════════════════════════════════════════════════════════════
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initExpandingCards();
    initFlipCards();
    initCardSlider('slider-tools');
    initCardSlider('slider-kyoto');
  });

})();
