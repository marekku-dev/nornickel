/**
 * chapter-5.js
 * Интерактивность страницы «Как мы можем замедлить изменение климата».
 *
 * Модули:
 *  1. ExpandingCards — раскрывающиеся карточки-аккордеон
 *  2. SliderInit     — инициализация слайдеров
 *  3. Quiz           — интерактивный тест (слайдер-викторина)
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
   *  3. QUIZ (интерактивный тест со слайдером)
   * ════════════════════════════════════════════════════════════ */

  const QUIZ_DATA = [
    {
      question: 'Какой процент учебных программ не&nbsp;упоминают про климат?',
      min: 0, max: 100, step: 1, correct: 47,
      fact: '47% учебных программ не&nbsp;упоминают климат. Почти половина государственных учебных программ в&nbsp;100 странах мира не&nbsp;содержит никакой информации об&nbsp;изменении климата',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
    {
      question: 'Сколько процентов молодёжи не&nbsp;могут объяснить, что такое изменение климата?',
      min: 0, max: 100, step: 1, correct: 70,
      fact: '70% опрошенной молодёжи не&nbsp;смогли объяснить, что такое изменение климата. Они также выразили беспокойство из-за низкого качества преподавания этой темы',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
    {
      question: 'Какой процент учителей уверенно говорит о&nbsp;климате?',
      min: 0, max: 100, step: 1, correct: 40,
      fact: '40% учителей по&nbsp;всему миру уверенно рассказывают о&nbsp;проблемах изменения климата. Но&nbsp;только половина из&nbsp;них (20% от&nbsp;общего числа) могут объяснить ученикам, как можно бороться с&nbsp;этой проблемой',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
    {
      question: 'Сколько экспертов приняли Берлинскую декларацию?',
      min: 0, max: 5000, step: 100, correct: 2800,
      fact: '2&nbsp;800 заинтересованных сторон из&nbsp;161 страны приняли Берлинскую декларацию об&nbsp;ОУР — документ, который призывает сделать образование ключевым элементом борьбы с&nbsp;изменением климата',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
    {
      question: 'Сколько стран готовят инициативы по&nbsp;ОУР?',
      min: 0, max: 200, step: 1, correct: 50,
      fact: '50 стран готовят национальные программы по&nbsp;образованию в&nbsp;интересах устойчивого развития (ОУР) до&nbsp;2030 года',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
    {
      question: 'Сколько стран присоединились к&nbsp;экологизации образования?',
      min: 0, max: 200, step: 1, correct: 97,
      fact: '97 стран и&nbsp;ещё более 1&nbsp;900 организаций уже присоединились к&nbsp;Партнёрству по&nbsp;экологизации образования',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
    {
      question: 'Сколько школ в&nbsp;мире уже стали «зелёными»?',
      min: 0, max: 200000, step: 1000, correct: 96000,
      fact: '96&nbsp;000 школ в&nbsp;93 странах мира уже соответствуют стандарту качества «зелёных» школ',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
    {
      question: 'Какой процент финансирования климатических действий получает образование?',
      min: 0, max: 20, step: 1, correct: 2,
      fact: 'Сейчас на&nbsp;образовательные проекты направляется менее 2% от&nbsp;денег, выделяемых в&nbsp;мире на&nbsp;борьбу с&nbsp;изменением климата',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
    {
      question: 'Сколько процентов школ должны стать «зелёными» к&nbsp;2030 году?',
      min: 0, max: 100, step: 1, correct: 50,
      fact: 'Согласно стандарту качества, к&nbsp;2030 году половина всех школ в&nbsp;каждой стране-участнице должна стать «зелёной»',
      source: 'https://www.unesco.org/ru/sustainable-development/education?hub=761',
    },
  ];

  function initQuiz() {
    const app = document.getElementById('quiz-app');
    if (!app) return;

    function $(sel, ctx) { return (ctx || document).querySelector(sel); }

    let current = 0;

    function fmt(num) {
      return Number(num).toLocaleString('ru-RU');
    }

    function updateFill(range) {
      const pct = (range.value - range.min) / (range.max - range.min) * 100;
      range.style.backgroundSize = pct + '% 100%';
    }

    function getReaction(userVal, correct) {
      const pct = Math.abs(userVal - correct) / correct;
      if (pct <= 0.05) return 'Вы правы!';
      if (pct <= 0.10) return 'Очень близко!';
      if (pct <= 0.20) return 'Вы довольно близки';
      if (pct <= 0.40) return 'Неплохо, но можно точнее';
      return 'Довольно далеко от правильного ответа';
    }

    function renderQuestion() {
      const q = QUIZ_DATA[current];
      app.innerHTML = `
        <div class="quiz__label">Предположите</div>
        <div class="quiz__question">${q.question}</div>
        <div class="quiz__value" id="quiz-value">${fmt(q.min)}</div>
        <input type="range" class="quiz__range" id="quiz-range"
               min="${q.min}" max="${q.max}" step="${q.step}" value="${q.min}">
        <button class="quiz__button" id="quiz-submit" type="button">Вот столько</button>
        <div class="quiz__progress">Вопрос ${current + 1} из ${QUIZ_DATA.length}</div>
      `;
      const range = $('#quiz-range', app);
      const value = $('#quiz-value', app);
      updateFill(range);
      range.addEventListener('input', () => {
        value.textContent = fmt(range.value);
        updateFill(range);
      });
      $('#quiz-submit', app).addEventListener('click', () => {
        renderAnswer(Number(range.value));
      });
    }

    function renderAnswer(userVal) {
      const q = QUIZ_DATA[current];
      app.innerHTML = `
        <div class="quiz__label">${getReaction(userVal, q.correct)}</div>
        <div class="quiz__answer">${q.fact}</div>
        <button class="quiz__button" id="quiz-next" type="button">Дальше</button>
        <div class="quiz__progress">Вопрос ${current + 1} из ${QUIZ_DATA.length}</div>
        <div class="quiz__source"><a href="${q.source}" target="_blank" rel="noopener">Источник</a></div>
      `;
      $('#quiz-next', app).addEventListener('click', () => {
        current++;
        if (current < QUIZ_DATA.length) {
          renderQuestion();
        } else {
          renderFinal();
        }
      });
    }

    function renderFinal() {
      app.innerHTML = `
        <div class="quiz__label">Тест завершён!</div>
        <div class="quiz__answer">Вы ответили на&nbsp;все вопросы о&nbsp;климатическом образовании.</div>
        <button class="quiz__button" id="quiz-restart" type="button">Пройти заново</button>
      `;
      $('#quiz-restart', app).addEventListener('click', () => {
        current = 0;
        renderQuestion();
      });
    }

    renderQuestion();
  }

  /* ════════════════════════════════════════════════════════════
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initExpandingCards();
    initSliders();
    initQuiz();
  });

})();
