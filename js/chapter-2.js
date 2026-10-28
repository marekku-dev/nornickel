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
        dot.setAttribute('aria-label', (document.documentElement.lang === 'en' ? 'Slide ' : 'Слайд ') + (i + 1));
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', () => goToSlide(id, i));
        nav.appendChild(dot);
      });
    }

    _sliders[id] = { current: 0, total };
    _renderSlider(id);

    // Touch/swipe (drag-follow из components.js)
    const wrap = document.getElementById(id);
    if (typeof window.attachSwipe === 'function' && wrap) {
      window.attachSwipe({
        area:  wrap,
        track: track,
        getCurrent: () => _sliders[id].current,
        getTotal:   () => _sliders[id].total,
        step:  () => wrap.getBoundingClientRect().width,
        onPrev:  () => slideChange(id, -1),
        onNext:  () => slideChange(id,  1),
        render:  () => _renderSlider(id),
        loop:  true
      });
    } else {
      let startX = 0;
      track.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
      track.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) slideChange(id, dx < 0 ? 1 : -1);
      }, { passive: true });
    }
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

  const IS_EN = document.documentElement.lang === 'en';

  const QUIZ_DATA = [
    {
      question: 'Сколько человек в&nbsp;мире не&nbsp;имеют доступа к&nbsp;пресной воде?',
      min: 0, max: 3000000000, step: 10000000, correct: 2000000000,
      fact: 'Около 2&nbsp;млрд человек не&nbsp;имеют доступа к&nbsp;чистой питьевой воде',
      source: 'https://www.ipcc.ch/report/ar6/wg2/downloads/outreach/IPCC_AR6_WGII_FactSheet_FoodAndWater.pdf',
    },
    {
      question: 'Какой процент всей воды на&nbsp;Земле — пресная?',
      min: 0, max: 10, step: 0.1, correct: 2.5,
      fact: 'Пресная вода составляет всего около 2,5% от&nbsp;общего объёма воды на&nbsp;Земле, и&nbsp;лишь около 1,2% из&nbsp;неё — относительно доступная поверхностная вода (реки, озёра, почвенная влага)',
      source: 'https://www.usgs.gov/water-science-school/science/where-earths-water',
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
      question: 'Насколько чаще (в процентах) стали случаться наводнения за&nbsp;последние 20&nbsp;лет?',
      min: 0, max: 200, step: 1, correct: 134,
      fact: 'Количество наводнений увеличилось примерно на&nbsp;134% за&nbsp;последние 20&nbsp;лет по&nbsp;сравнению с&nbsp;двумя предыдущими десятилетиями',
      source: 'https://public.wmo.int/en/media/press-release/wake-looming-water-crisis-report-warns',
    },
  ];

  // Английские тексты теста (порядок совпадает с QUIZ_DATA)
  const QUIZ_EN = [
    { question: 'How many people worldwide lack access to fresh water?',
      fact: 'Around 2 billion people lack access to clean drinking water' },
    { question: 'What percentage of all the water on Earth is fresh water?',
      fact: 'Fresh water accounts for only about 2.5% of all the water on Earth, and only around 1.2% of that is relatively accessible surface water, such as rivers, lakes, and soil moisture' },
    { question: 'What percentage of the world’s population depends on water from mountain glaciers?',
      fact: 'Around one in six people worldwide depends on water from mountain glaciers' },
    { question: 'What percentage of all fresh water is used in agriculture?',
      fact: 'Around 70% of fresh water consumed is used in agriculture' },
    { question: 'How many litres of water are needed to produce enough food for one person for one day?',
      fact: 'Producing enough food for one person for one day requires between 2 thousand and 5 thousand litres of water' },
    { question: 'By what percentage have floods become more frequent over the past 20 years?',
      fact: 'The number of floods has increased by around 134% over the past 20 years compared with the previous two decades' }
  ];
  if (IS_EN) {
    QUIZ_DATA.forEach((q, i) => {
      if (!QUIZ_EN[i]) return;
      q.question = QUIZ_EN[i].question;
      q.fact     = QUIZ_EN[i].fact;
      q.source   = q.source.replace('unesco.org/ru/', 'unesco.org/en/');
    });
  }

  const QUIZ_UI = IS_EN ? {
    guess: 'Take a guess', submit: 'This much', next: 'Next', source: 'Source',
    progress: (n, m) => `Question ${n} of ${m}`,
    done: 'Quiz complete!', final: 'You’ve answered all the questions about fresh water.', restart: 'Try again',
    reactions: ["You’re right!", "Very close!", "Pretty close", "Not bad, but you could be more precise", "Quite far from the correct answer"],
  } : {
    guess: 'Предположите', submit: 'Вот столько', next: 'Дальше', source: 'Источник',
    progress: (n, m) => `Вопрос ${n} из ${m}`,
    done: 'Тест завершён!', final: 'Вы ответили на все вопросы о пресной воде.', restart: 'Пройти заново',
    reactions: ['Вы правы!', 'Очень близко!', 'Вы довольно близки', 'Неплохо, но можно точнее', 'Довольно далеко от правильного ответа'],
  };

  // Типограф для текстов теста (висячие предлоги) — функция из no-hanging-prepositions.js
  const typo = (t) => (typeof window.fixHangingText === 'function') ? window.fixHangingText(t) : t;

  function initQuiz() {
    const app = document.getElementById('quiz-app');
    if (!app) return;

    let current = 0;

    function fmt(num) {
      return Number(num).toLocaleString(IS_EN ? 'en-US' : 'ru-RU');
    }

    function updateFill(range) {
      const pct = (range.value - range.min) / (range.max - range.min) * 100;
      range.style.backgroundSize = pct + '% 100%';
    }

    function getReaction(userVal, correct) {
      const pct = Math.abs(userVal - correct) / correct;
      if (pct <= 0.05) return QUIZ_UI.reactions[0];
      if (pct <= 0.10) return QUIZ_UI.reactions[1];
      if (pct <= 0.20) return QUIZ_UI.reactions[2];
      if (pct <= 0.40) return QUIZ_UI.reactions[3];
      return QUIZ_UI.reactions[4];
    }

    function renderQuestion() {
      const q = QUIZ_DATA[current];
      app.innerHTML = `
        <div class="quiz__label">${QUIZ_UI.guess}</div>
        <div class="quiz__question">${typo(q.question)}</div>
        <div class="quiz__value" id="quiz-value">${fmt(q.min)}</div>
        <input type="range" class="quiz__range" id="quiz-range"
               min="${q.min}" max="${q.max}" step="${q.step}" value="${q.min}">
        <button class="quiz__button" id="quiz-submit" type="button">${QUIZ_UI.submit}</button>
        <div class="quiz__progress">${QUIZ_UI.progress(current + 1, QUIZ_DATA.length)}</div>
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
        <div class="quiz__answer">${typo(q.fact)}</div>
        <button class="quiz__button" id="quiz-next" type="button">${QUIZ_UI.next}</button>
        <div class="quiz__progress">${QUIZ_UI.progress(current + 1, QUIZ_DATA.length)}</div>
        <div class="quiz__source"><a href="${q.source}" target="_blank" rel="noopener">${QUIZ_UI.source}</a></div>
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
        <div class="quiz__label">${QUIZ_UI.done}</div>
        <div class="quiz__answer">${QUIZ_UI.final}</div>
        <button class="quiz__button" id="quiz-restart" type="button">${QUIZ_UI.restart}</button>
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
