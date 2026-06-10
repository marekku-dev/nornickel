/**
 * chapter-1.js
 * Интерактивность страницы «Основы изменения климата».
 *
 * Модули:
 *  1. Slider          — универсальный touch/click-слайдер
 *  2. ImageSync       — sticky-секция: переключение фото при скролле
 *  3. Tooltips        — всплывающие определения терминов
 *  4. Physics (p5.js) — анимации физических законов
 *
 * Все модули инициализируются по DOMContentLoaded.
 * p5-анимации запускаются через requestIdleCallback (не блокируют LCP/FID).
 */

(function () {
  'use strict';

  /* ─── Утилита: сокращение $ ─── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ════════════════════════════════════════════════════════════
   *  1. SLIDER
   * ════════════════════════════════════════════════════════════ */

  const _sliders = {};

  function initSlider(id) {
    const wrap  = document.getElementById(id);
    const track = document.getElementById(id + '-mask');
    if (!wrap || !track) return;

    const slides = $$('.slider__slide', track);
    const total  = slides.length;
    if (!total) return;

    const nav = document.getElementById(id + '-nav');

    // Создаём точки-навигаторы
    if (nav) {
      nav.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className   = 'slider__dot' + (i === 0 ? ' slider__dot--active' : '');
        dot.type        = 'button';
        dot.setAttribute('aria-label', `Слайд ${i + 1}`);
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', () => goToSlide(id, i));
        nav.appendChild(dot);
      });
    }

    _sliders[id] = { current: 0, total };
    _renderSlider(id);

    // Touch/swipe поддержка
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
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

  // Экспортируем для onclick-атрибутов в HTML
  window.slideChange = slideChange;

  /* ════════════════════════════════════════════════════════════
   *  2. STICKY IMAGE SYNC
   *     Меняет фото в .sticky-images при скролле text-cards.
   * ════════════════════════════════════════════════════════════ */

  function initImageSync() {
    // На мобиле и десктопе используются разные наборы фото,
    // но смену триггерят одни и те же карточки по их индексу.
    const desktopImages = $$('.sticky-images .sticky-images__img');
    const mobileImages  = $$('.sticky-images .sticky-images__img--mobile');
    const cards  = $$('.sticky-text-card');
    if (!desktopImages.length || !cards.length) return;

    function visibleImages() {
      // Берём тот набор, который реально отображается (display != none)
      const useMobile = mobileImages.length &&
        getComputedStyle(mobileImages[0]).display !== 'none';
      return useMobile ? mobileImages : desktopImages;
    }

    function showImage(idx) {
      visibleImages().forEach((img, i) => {
        img.style.opacity = i === idx ? '1' : '0';
      });
    }

    let current = 0;
    showImage(0);

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = cards.indexOf(entry.target);
        if (idx < 0 || idx === current) return;
        current = idx;
        showImage(idx);
      });
    }, { threshold: 0.5 });

    cards.forEach(c => obs.observe(c));
    window.addEventListener('resize', () => showImage(current));
  }

  /* ════════════════════════════════════════════════════════════
   *  3. TOOLTIPS
   * ════════════════════════════════════════════════════════════ */

  const TOOLTIP_DATA = {
    'span-warming': 'Определение МГЭИК — межправительственной группы экспертов по изменению климата',
  };

  function initTooltips() {
    const box = document.getElementById('tooltip-global');
    if (!box) return;

    for (const [id, text] of Object.entries(TOOLTIP_DATA)) {
      const el = document.getElementById(id);
      if (!el) continue;

      const show = () => {
        box.textContent = text;
        box.style.display = 'block';
        const r = el.getBoundingClientRect();
        const tooltipW = 360; // примерная ширина, см. CSS
        box.style.top  = (r.bottom + window.scrollY + 8) + 'px';
        box.style.left = Math.max(10, Math.min(r.left, window.innerWidth - tooltipW - 10)) + 'px';
      };
      const hide = () => { box.style.display = 'none'; };

      el.addEventListener('mouseenter', show);
      el.addEventListener('focus',      show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('blur',       hide);
    }
  }

  /* ════════════════════════════════════════════════════════════
   *  4. P5.JS PHYSICS ANIMATIONS
   *     Запускаются через requestIdleCallback, чтобы не блокировать
   *     критический путь рендеринга.
   * ════════════════════════════════════════════════════════════ */

  const FPS           = 30;
  const LOOP_DURATION = 5000; // ms
  const TOTAL_FRAMES  = (LOOP_DURATION / 1000) * FPS;
  const BG            = '#fffbf5';

  /** Прогресс текущей петли [0..1] */
  function loopProgress(p) {
    return (p.frameCount % TOTAL_FRAMES) / TOTAL_FRAMES;
  }

  /** Пунктирная линия */
  function dottedLine(p, x1, y1, x2, y2) {
    const dashLen = 3, gapLen = 2;
    const d  = p.dist(x1, y1, x2, y2);
    const s  = d / (dashLen + gapLen);
    const dx = (x2 - x1) / s;
    const dy = (y2 - y1) / s;
    p.stroke(0);
    p.strokeWeight(1);
    for (let i = 0; i < s; i++) {
      const sx = x1 + dx * i, sy = y1 + dy * i;
      p.line(sx, sy, sx + dx * dashLen / (dashLen + gapLen), sy + dy * dashLen / (dashLen + gapLen));
    }
  }

  function initPhysics() {
    if (typeof p5 === 'undefined') return; // p5.js не загружен

    // — Закон сохранения энергии (маятник) —
    new p5(p => {
      const len = 90;
      p.setup = () => {
        p.createCanvas(260, 260).parent('energy-container');
        p.frameRate(FPS);
      };
      p.draw = () => {
        p.background(BG);
        const pr   = loopProgress(p);
        const angle = p.cos(pr * p.TWO_PI) * p.PI / 4;
        const ox = p.width / 2, oy = 65;
        const bx = ox + len * p.sin(angle);
        const by = oy + len * p.cos(angle);

        // Дуга и горизонталь
        p.noFill(); p.stroke(0); p.strokeWeight(1);
        p.arc(ox, oy, len * 2, len * 2, 0, p.PI);
        dottedLine(p, 35, oy + len, p.width - 35, oy + len);

        // Вертикаль проекции
        p.stroke(0); p.strokeWeight(1);
        p.line(bx, by, bx, oy + len);

        // Нить маятника
        p.strokeWeight(1.5);
        p.line(ox, oy, bx, by);

        // Шарнир и шар
        p.fill(255); p.stroke(0); p.strokeWeight(1.5);
        p.circle(ox, oy, 6);
        p.circle(bx, by, 16);

        // Стрелка скорости
        const angularVel = -p.sin(pr * p.TWO_PI) * p.TWO_PI / TOTAL_FRAMES * p.PI / 4;
        const vx = angularVel * 26;
        p.stroke(0); p.strokeWeight(1.5);
        p.line(bx, by, bx + vx, by);
        if (p.abs(vx) > 2) {
          const arrowSize = 4;
          const dir       = vx > 0 ? 0 : p.PI;
          p.push();
          p.translate(bx + vx, by);
          p.rotate(dir);
          p.line(0, 0, -arrowSize, -arrowSize / 2);
          p.line(0, 0, -arrowSize,  arrowSize / 2);
          p.pop();
        }
      };
    });

    // — Закон Стефана–Больцмана —
    new p5(p => {
      p.setup = () => {
        p.createCanvas(260, 260).parent('stefan-container');
        p.frameRate(FPS);
      };
      p.draw = () => {
        p.background(BG);
        const pr   = loopProgress(p);
        const t    = pr * p.TWO_PI;
        const pw   = p.pow(p.map(5000, 1000, 6000, 0, 1), 4);
        const cx   = p.width / 2, cy = p.height / 2, br = 32;

        p.stroke(0); p.strokeWeight(1); p.noFill();
        for (let i = 1; i <= 4; i++) {
          const r  = br + i * 20 * pw;
          const ph = t - i * 0.4;
          const op = (p.sin(ph) + 1) / 2;
          if (op > 0.3) p.circle(cx, cy, r * 2);
        }
        p.fill(255); p.stroke(0); p.strokeWeight(1.5);
        p.circle(cx, cy, br * 2);
      };
    });

    // — Уравнение Клаузиуса–Клапейрона —
    new p5(p => {
      let pts = [];
      p.setup = () => {
        p.createCanvas(260, 260).parent('clausius-container');
        p.frameRate(FPS);
        p.randomSeed(42);
        for (let i = 0; i < 15; i++) {
          pts.push({ bx: p.random(65, 195), by: p.random(130, 208), px: p.random(p.TWO_PI), py: p.random(p.TWO_PI) });
        }
      };
      p.draw = () => {
        p.background(BG);
        const pr   = loopProgress(p);
        const t    = pr * p.TWO_PI;
        const cx = 65, cy = 65, cw = 130, ch = 162;
        const liq = p.map(1, 0.135, 7.4, ch - 20, ch - 78);

        p.stroke(0); p.strokeWeight(1.5); p.noFill();
        p.line(cx, cy + ch, cx, cy);
        p.line(cx + cw, cy + ch, cx + cw, cy);
        p.line(cx, cy + ch, cx + cw, cy + ch);
        dottedLine(p, cx, cy + liq, cx + cw, cy + liq);

        for (const pt of pts) {
          const above = pt.by < cy + liq;
          let x = pt.bx + (above ? p.sin(t + pt.px) * 10  : p.sin(t + pt.px) * 2);
          let y = pt.by + (above ? p.sin(t + pt.py) * 7   : p.sin(t + pt.py) * 1.5);
          x = p.constrain(x, cx + 4, cx + cw - 4);
          y = p.constrain(y, cy + 4, cy + ch - 4);
          p.stroke(0); p.strokeWeight(1); p.noFill();
          p.circle(x, y, 4);
        }
      };
    });

    // — Уравнения Навье–Стокса —
    new p5(p => {
      let pts = [], obs;
      p.setup = () => {
        p.createCanvas(260, 260).parent('navier-container');
        p.frameRate(FPS);
        p.randomSeed(123);
        obs = { x: p.width / 2, y: p.height / 2, r: 20 };
        for (let i = 0; i < 40; i++) {
          pts.push({ sx: (i / 40) * 260, sy: 52 + (i % 7) * 16, ph: (i / 40) * p.TWO_PI });
        }
      };
      p.draw = () => {
        p.background(BG);
        const pr = loopProgress(p);

        // Линии тока
        for (const pt of pts) {
          const lpp = (pr + pt.ph / p.TWO_PI) % 1;
          const px  = lpp * p.width;
          let   py  = pt.sy;
          const dx = px - obs.x, dy = py - obs.y, d = p.sqrt(dx * dx + dy * dy);
          if (d < obs.r + 40) {
            const a = p.atan2(dy, dx);
            const f = p.constrain(p.map(d, obs.r, obs.r + 40, 1, 0), 0, 1);
            py += p.sin(a) * f * 26 * 0.9;
          }

          // Хвост
          const tailLen = 13;
          p.noFill(); p.stroke(0); p.strokeWeight(1);
          p.beginShape();
          for (let j = 0; j < tailLen; j++) {
            const tp = lpp - (j / 40) / (p.width / 1.6);
            if (tp < 0) break;
            const tx  = tp * p.width;
            let   ty  = pt.sy;
            const tdx = tx - obs.x, tdy = ty - obs.y, td = p.sqrt(tdx * tdx + tdy * tdy);
            if (td < obs.r + 40) {
              const ta = p.atan2(tdy, tdx);
              const tf = p.constrain(p.map(td, obs.r, obs.r + 40, 1, 0), 0, 1);
              ty += p.sin(ta) * tf * 26 * 0.9;
            }
            p.vertex(tx, ty);
          }
          p.endShape();

          // Точка
          p.fill(0); p.noStroke(); p.circle(px, py, 2);
        }

        // Поле скоростей
        p.stroke(0); p.strokeWeight(1);
        for (let x = 52; x < p.width - 52; x += 26) {
          for (let y = 52; y < 208; y += 26) {
            const dx = x - obs.x, dy = y - obs.y, d = p.sqrt(dx * dx + dy * dy);
            if (d > obs.r + 10 && d < obs.r + 52) {
              const a  = p.atan2(dy, dx);
              const f  = p.map(d, obs.r, obs.r + 52, 1, 0);
              const vx = 1.6 + p.cos(a) * f * 1.3 * 0.9;
              const vy = p.sin(a) * f * 1.3 * 0.9;
              const ex = x + vx * 2.6, ey = y + vy * 2.6;
              p.line(x, y, ex, ey);
              const aa = p.atan2(vy, vx);
              p.push();
              p.translate(ex, ey); p.rotate(aa);
              p.line(0, 0, -2, -1.5);
              p.line(0, 0, -2,  1.5);
              p.pop();
            }
          }
        }

        // Препятствие
        p.fill(255); p.stroke(0); p.strokeWeight(1.5);
        p.circle(obs.x, obs.y, obs.r * 2);
      };
    });
  }

  /* ════════════════════════════════════════════════════════════
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initSlider('slider-causes');
    initSlider('slider-scientists');
    initImageSync();
    initTooltips();

    // p5.js запускаем в idle, чтобы не задерживать FID
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initPhysics, { timeout: 2000 });
    } else {
      setTimeout(initPhysics, 300);
    }
  });

})();
