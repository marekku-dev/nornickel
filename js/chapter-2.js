/**
 * chapter-2.js
 * Интерактивность страницы «В чём проявляются изменения климата».
 *
 * Модули:
 *  1. Slider        — слайдеры (переиспользует slideChange из chapter-1 паттерн)
 *  2. BeforeAfter   — перетягиваемый разделитель «до / после»
 *  3. Quiz          — интерактивная викторина о пресной воде
 *  4. Tooltips      — всплывающие подсказки для терминов
 */

(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ════════════════════════════════════════════════════════════
   *  1. SLIDER (та же логика, что в chapter-1.js)
   * ════════════════════════════════════════════════════════════ */

  const _sliders = {};

  function initSlider(id) {
    const track = document.getElementById(id + '-mask');
    if (!track) return;
    const slides = $$('.slider__slide', track);
    const total  = slides.length;
    if (!total) return;

    const nav = document.getElementById(id + '-nav');
    if (nav) {
      nav.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider__dot' + (i === 0 ? ' slider__dot--active' : '');
        dot.type      = 'button';
        dot.setAttribute('aria-label', `Слайд ${i + 1}`);
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', () => goToSlide(id, i));
        nav.appendChild(dot);
      });
    }

    _sliders[id] = { current: 0, total };
    _renderSlider(id);

    // Touch/swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) slideChange(id, dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function _renderSlider(id) {
    const s = _sliders[id];
    if (!s) return;
    const track = document.getElementById(id + '-mask');
    if (track) track.style.transform = `translateX(-${s.current * 100}%)`;
    $$('#' + id + '-nav .slider__dot').forEach((dot, i) => {
      dot.classList.toggle('slider__dot--active', i === s.current);
      dot.setAttribute('aria-selected', String(i === s.current));
    });
  }

  function slideChange(id, dir) {
    const s = _sliders[id];
    if (!s) return;
    s.current = (s.current + dir + s.total) % s.total;
    _renderSlider(id);
  }

  function goToSlide(id, index) {
    const s = _sliders[id];
    if (!s) return;
    s.current = index;
    _renderSlider(id);
  }

  window.slideChange = slideChange;

  /* ════════════════════════════════════════════════════════════
   *  2. BEFORE / AFTER SLIDER
   * ════════════════════════════════════════════════════════════ */

  function initBeforeAfter() {
    const container = document.getElementById('before-after-crater');
    const topImg    = document.getElementById('ba-top-img');
    const divider   = document.getElementById('ba-divider');
    if (!container || !topImg || !divider) return;

    let dragging = false;

    function setPosition(clientX) {
      const rect = container.getBoundingClientRect();
      let pct = (clientX - rect.left) / rect.width * 100;
      pct = Math.max(0, Math.min(100, pct));
      topImg.style.clipPath  = `inset(0 ${100 - pct}% 0 0)`;
      divider.style.left     = pct + '%';
    }

    // Mouse
    container.addEventListener('mousedown',  () => { dragging = true; });
    window.addEventListener   ('mouseup',    () => { dragging = false; });
    window.addEventListener   ('mousemove',  e => { if (dragging) setPosition(e.clientX); });

    // Touch
    container.addEventListener('touchstart', () => { dragging = true; },             { passive: true });
    window.addEventListener   ('touchend',   () => { dragging = false; },            { passive: true });
    window.addEventListener   ('touchmove',  e => {
      if (dragging) setPosition(e.touches[0].clientX);
    }, { passive: true });
  }

  /* ════════════════════════════════════════════════════════════
   *  3. QUIZ
   * ════════════════════════════════════════════════════════════ */

  const QUIZ_DATA = [
    {
      question: 'Сколько человек в&nbsp;мире не&nbsp;имеют доступа к&nbsp;пресной воде?',
      min: 0, max: 3000000000, step: 10000000, correct: 2000000000,
      fact: 'Около 2&nbsp;млрд человек не&nbsp;имеют доступа к&nbsp;чистой питьевой воде',
      source: 'https://www.ipcc.ch/report/ar6/wg2/downloads/outreach/IPCC_AR6_WGII_FactSheet_FoodAndWater.pdf',
    },
    {
      question: 'Какой процент всей воды на&nbsp;Земле — пресная?',
      min: 0, max: 10, step: 0.1, correct: 0.5,
      fact: 'Лишь 0,5% водных ресурсов Земли доступны и&nbsp;пригодны для питья',
      source: 'https://public.wmo.int/en/media/press-release/wake-looming-water-crisis-report-warns',
    },
    {
      question: 'Сколько процентов людей в&nbsp;мире зависят от&nbsp;воды горных ледников?',
      min: 0, max: 100, step: 1, correct: 17,
      fact: 'Примерно каждый шестой человек в&nbsp;мире зависит от&nbsp;воды горных ледников',
      source: 'https://archive.ipcc.ch/pdf/technical-papers/climate-change-water-en.pdf',
    },
    {
      question: 'Какой процент всей пресной воды используется в&nbsp;сельском хозяйстве?',
      min: 0, max: 100, step: 1, correct: 70,
      fact: 'Около 70% потребляемой пресной воды используется в&nbsp;сельском хозяйстве',
      source: 'https://www.ipcc.ch/site/assets/uploads/2018/02/WGIIAR5-Chap3_FINAL.pdf',
    },
    {
      question: 'Сколько литров воды нужно, чтобы прокормить одного человека в&nbsp;день?',
      min: 0, max: 10000, step: 100, correct: 3500,
      fact: 'Для производства еды на&nbsp;одного человека в&nbsp;день нужно от&nbsp;2 до&nbsp;5&nbsp;тыс. литров воды',
      source: 'https://www.fao.org/3/i7959e/i7959e.pdf',
    },
    {
      question: 'Насколько чаще (в процентах) стали случаться наводнения за&nbsp;последние 25&nbsp;лет?',
      min: 0, max: 200, step: 1, correct: 134,
      fact: 'Количество наводнений увеличилось примерно на&nbsp;134% за&nbsp;последние 20&nbsp;лет',
      source: 'https://public.wmo.int/en/media/press-release/wake-looming-water-crisis-report-warns',
    },
  ];

  function initQuiz() {
    const app = document.getElementById('quiz-app');
    if (!app) return;

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
        <div class="quiz__answer">Вы ответили на все вопросы о пресной воде.</div>
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
   *  4. TOOLTIPS — вынесены в общий js/tooltips.js (объект TOOLTIPS).
   *     initTooltips() зовётся из components.js, здесь дублировать не нужно.
   * ════════════════════════════════════════════════════════════ */

  /* ════════════════════════════════════════════════════════════
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initSlider('slider-currents');
    initSlider('slider-ecosystems');
    initBeforeAfter();
    initQuiz();
  });

})();
