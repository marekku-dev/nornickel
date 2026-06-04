/**
 * chapter-3.js
 * Интерактивность страницы «Как изменение климата влияет на экономику».
 *
 * Модули:
 *  1. ExpandingCards — раскрывающиеся карточки-аккордеон
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
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initExpandingCards();
  });

})();
