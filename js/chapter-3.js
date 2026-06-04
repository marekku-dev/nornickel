/**
 * chapter-3.js
 * Интерактивность страницы «Как изменение климата влияет на экономику».
 *
 * Модули:
 *  1. ExpandingCards — раскрывающиеся карточки-аккордеон
 *  2. FlipCards      — флип-карточки транспорта (touch-поддержка)
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

    const cards = Array.from(document.querySelectorAll('.card-white'));
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
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initExpandingCards();
    initFlipCards();
  });

})();
