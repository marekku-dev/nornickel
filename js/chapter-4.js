/**
 * chapter-4.js
 * Интерактивность страницы «Как мир реагирует на изменение климата».
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
   *  2. КАРТА РИСКОВ — переключатель слоёв
   * ════════════════════════════════════════════════════════════ */

  // TODO: replace ch4-map1.png with layer-specific exports from Figma once available
  const RISK_IMAGES = {
    wind:    'img/ch4-russia-map-wind.png',
    rain:    'img/ch4-russia-map-rain.png',
    fire:    'img/ch4-russia-map-fire.png',
    heat:    'img/ch4-russia-map-heat.png',
    drought: 'img/ch4-russia-map-drought.png',
  };

  // Fallback: if layer image is missing, use the base map
  const RISK_IMAGES_FALLBACK = 'img/ch4-map1.png';

  const RISK_ALT = {
    wind:    'Карта климатических рисков — Ветер',
    rain:    'Карта климатических рисков — Осадки',
    fire:    'Карта климатических рисков — Пожары',
    heat:    'Карта климатических рисков — Жара',
    drought: 'Карта климатических рисков — Засуха',
  };

  function initRiskMap() {
    const tabs = Array.from(document.querySelectorAll('.risk-map__tab'));
    const img  = document.getElementById('risk-map-img');
    if (!tabs.length || !img) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const risk = tab.dataset.risk;
        if (!risk || !RISK_IMAGES[risk]) return;

        // Активная таблетка
        tabs.forEach(t => {
          t.classList.remove('risk-map__tab--active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('risk-map__tab--active');
        tab.setAttribute('aria-selected', 'true');

        // Смена картинки с fade
        const newSrc = RISK_IMAGES[risk];
        img.classList.add('risk-map__img--fade');
        setTimeout(() => {
          const testImg = new Image();
          testImg.onload = () => { img.src = newSrc; };
          testImg.onerror = () => { img.src = RISK_IMAGES_FALLBACK; };
          testImg.src = newSrc;
          img.alt = RISK_ALT[risk];
          img.classList.remove('risk-map__img--fade');
        }, 200);
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initExpandingCards();
    initRiskMap();
  });

})();
