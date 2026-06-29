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

  // Топ-10 регионов риска по методологии ВШЭ
  // («национальный взгляд», сценарий SSP2-4.5). Коды — ISO 3166-2:RU.
  const RISK_TOP = {
    heat:       ['RU-MOW','RU-SPE','RU-MOS','RU-KDA','RU-SAM','RU-ROS','RU-SVE','RU-SAR','RU-NIZ','RU-CHE'],
    drought:    ['RU-STA','RU-KDA','RU-KL','RU-ROS','RU-DA','RU-MOS','RU-BEL','RU-CHE','RU-KC'], // Крым — нет контура на карте
    fire:       ['RU-KYA','RU-SA','RU-IRK','RU-KHA','RU-KHM','RU-TOM','RU-ZAB','RU-YAN','RU-KO','RU-BU'],
    permafrost: ['RU-SA','RU-YAN','RU-AMU','RU-KYA','RU-BU','RU-IRK','RU-KO','RU-MAG','RU-ZAB','RU-KAM'],
    precip:     ['RU-IRK','RU-PRI','RU-AMU','RU-PER','RU-KHA','RU-KYA','RU-ARK','RU-SVE','RU-LEN','RU-ZAB'],
  };

  const RISK_LABELS = {
    heat:       'Волны тепла',
    drought:    'Водный стресс',
    fire:       'Лесные пожары',
    permafrost: 'Вечная мерзлота',
    precip:     'Сильные осадки',
  };

  // Свой акцентный цвет для каждого риска (палитра из блока CCPI + пятый)
  const RISK_COLORS = {
    heat:       '#e07b3a', // оранжевый
    drought:    '#3a8fb0', // синий
    fire:       '#c49a2a', // золотой
    permafrost: '#7b6bbf', // фиолетовый
    precip:     '#5a9e5a', // зелёный
  };

  function initRiskMap() {
    const stage   = document.getElementById('risk-map-stage');
    const tabs    = Array.from(document.querySelectorAll('.risk-map__tab'));
    const tooltip = document.getElementById('risk-map-tooltip');
    const legendT = document.getElementById('risk-map-legend-title');
    if (!stage || !tabs.length) return;

    // Загружаем SVG-карту и инжектим её инлайн (чтобы красить регионы и ловить наведение)
    fetch('img/russia.svg')
      .then(r => r.text())
      .then(markup => {
        const tmp = document.createElement('div');
        tmp.innerHTML = markup.trim();
        const svg = tmp.querySelector('svg');
        if (!svg) return;

        svg.classList.add('risk-map__svg');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        if (!svg.getAttribute('viewBox')) {
          svg.setAttribute('viewBox', '0 0 1224.449 760.6203');
        }
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        // Вставляем перед легендой, чтобы легенда и тултип лежали поверх
        stage.insertBefore(svg, stage.firstChild);

        wireMap(svg);
      })
      .catch(() => { /* карта недоступна — оставляем пустой stage */ });

    function wireMap(svg) {
      const regions = Array.from(svg.querySelectorAll('path[id^="RU-"]'));

      // Тултип при наведении
      regions.forEach(path => {
        const name = path.getAttribute('title') || '';
        path.addEventListener('mousemove', e => showTip(e, name));
        path.addEventListener('mouseenter', () => path.classList.add('is-hover'));
        path.addEventListener('mouseleave', () => {
          path.classList.remove('is-hover');
          hideTip();
        });
      });

      function paint(risk) {
        const top = new Set(RISK_TOP[risk] || []);
        regions.forEach(path => {
          path.classList.toggle('is-top', top.has(path.id));
        });
      }

      function showTip(e, name) {
        if (!tooltip || !name) return;
        const box = stage.getBoundingClientRect();
        tooltip.textContent = name;
        tooltip.style.left = (e.clientX - box.left) + 'px';
        tooltip.style.top  = (e.clientY - box.top) + 'px';
        tooltip.classList.add('is-visible');
      }
      function hideTip() {
        if (tooltip) tooltip.classList.remove('is-visible');
      }

      function selectRisk(risk) {
        if (!risk || !RISK_TOP[risk]) return;
        // Акцентный цвет риска — управляет картой, легендой и активной вкладкой
        const color = RISK_COLORS[risk] || 'var(--color-accent)';
        stage.style.setProperty('--risk-color', color);
        tabs.forEach(t => {
          const active = (t.dataset.risk === risk);
          t.classList.toggle('risk-map__tab--active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        if (legendT) legendT.textContent = RISK_LABELS[risk];
        paint(risk);
      }

      // Каждой вкладке — свой цвет (для активного состояния и ховера)
      tabs.forEach(tab => {
        const c = RISK_COLORS[tab.dataset.risk];
        if (c) tab.style.setProperty('--risk-color', c);
        tab.addEventListener('click', () => selectRisk(tab.dataset.risk));
      });

      // Стартовая отрисовка — первая активная вкладка
      const active = tabs.find(t => t.classList.contains('risk-map__tab--active')) || tabs[0];
      selectRisk(active.dataset.risk);
    }
  }

  /* ════════════════════════════════════════════════════════════
   *  INIT
   * ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initExpandingCards();
    initRiskMap();
    initIpccChart();
  });

  /* ════════════════════════════════════════════════════════════
   *  IPCC CHART — интерактивный график CO₂
   * ════════════════════════════════════════════════════════════ */

  function initIpccChart() {
    const canvas = document.getElementById('ipcc-chart');
    if (!canvas) return;

    const CO2 = [
      [1990, 354.4], [1991, 356.3], [1992, 356.8], [1993, 357.0], [1994, 358.9],
      [1995, 360.9], [1996, 362.6], [1997, 363.8], [1998, 366.6], [1999, 368.3],
      [2000, 369.5], [2001, 371.1], [2002, 373.2], [2003, 375.8], [2004, 377.5],
      [2005, 379.8], [2006, 381.9], [2007, 383.8], [2008, 385.6], [2009, 387.4],
      [2010, 389.9], [2011, 391.6], [2012, 393.9], [2013, 396.5], [2014, 398.6],
      [2015, 400.8], [2016, 404.2], [2017, 406.5], [2018, 408.5], [2019, 411.4],
      [2020, 414.2], [2021, 416.5],
    ];

    const REPORTS = [
      {
        year: 1990, co2: 354.4,
        label: '1-й доклад МГЭИК',
        quote: '«Выбросы в результате деятельности человека существенно увеличивают концентрацию парниковых газов в атмосфере. Это приведёт к дополнительному потеплению поверхности Земли.»',
      },
      {
        year: 1995, co2: 360.9,
        label: '2-й доклад МГЭИК',
        quote: '«Концентрации парниковых газов в атмосфере значительно возросли. Эти тенденции в значительной мере объясняются деятельностью человека.»',
      },
      {
        year: 2001, co2: 371.1,
        label: '3-й доклад МГЭИК',
        quote: '«Появились новые и более убедительные доказательства того, что большая часть потепления за последние 50 лет связана с деятельностью человека.»',
      },
      {
        year: 2007, co2: 383.8,
        label: '4-й доклад МГЭИК',
        quote: '«Потепление климатической системы неоспоримо. Большая часть роста глобальной температуры с середины XX века весьма вероятно обусловлена антропогенным увеличением концентраций парниковых газов.»',
      },
      {
        year: 2014, co2: 398.6,
        label: '5-й доклад МГЭИК',
        quote: '«Влияние человека на климатическую систему очевидно, а последние антропогенные выбросы парниковых газов являются наибольшими в истории.»',
      },
      {
        year: 2021, co2: 416.5,
        label: '6-й доклад МГЭИК',
        quote: '«Однозначно, что влияние человека привело к потеплению атмосферы, океана и суши.»',
      },
    ];

    const ACCENT  = '#c49a2a';
    const LINECOL = '#1a1a1a';
    const BGCOL   = '#f5eee3';
    const GRIDCOL = 'rgba(26,26,26,0.10)';
    const FONT    = '"Inter", "Helvetica Neue", Arial, sans-serif';
    const PAD     = { top: 40, right: 56, bottom: 48, left: 52 };
    const MIN_Y = 340, MAX_Y = 430, MIN_X = 1990, MAX_X = 2021;

    let hovered = null;
    let tooltip  = null;
    let logicalW = 0, logicalH = 0;
    let closeBtn = null; // {x, y, r} зона крестика в логических координатах (только тач)

    const isMobileView = () => window.innerWidth <= 767;

    function xPos(year, W) {
      return PAD.left + (year - MIN_X) / (MAX_X - MIN_X) * (W - PAD.left - PAD.right);
    }
    function yPos(val, H) {
      return PAD.top + (1 - (val - MIN_Y) / (MAX_Y - MIN_Y)) * (H - PAD.top - PAD.bottom);
    }

    function wrapText(ctx, text, maxW) {
      const words = text.split(' ');
      const lines = [];
      let cur = '';
      words.forEach(w => {
        const test = cur ? cur + ' ' + w : w;
        if (ctx.measureText(test).width > maxW) { lines.push(cur); cur = w; }
        else cur = test;
      });
      if (cur) lines.push(cur);
      return lines;
    }

    function draw() {
      const W = logicalW, H = logicalH;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // Фон
      ctx.fillStyle = BGCOL;
      ctx.fillRect(0, 0, W, H);

      // Сетка и подписи Y
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = GRIDCOL;
      ctx.lineWidth = 1;
      ctx.font = `13px ${FONT}`;
      ctx.fillStyle = 'rgba(26,26,26,0.40)';
      ctx.textAlign = 'right';
      [340, 360, 380, 400, 420].forEach(v => {
        const y = yPos(v, H);
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
        ctx.fillText(v, PAD.left - 8, y + 4);
      });
      ctx.setLineDash([]);

      // Подписи X
      ctx.fillStyle = 'rgba(26,26,26,0.40)';
      [1990, 1995, 2000, 2005, 2010, 2015, 2020].forEach(yr => {
        ctx.textAlign = yr === 1990 ? 'left' : 'center';
        ctx.fillText(yr, xPos(yr, W), H - PAD.bottom + 20);
      });

      // Линия CO₂
      ctx.beginPath();
      ctx.strokeStyle = LINECOL;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      CO2.forEach(([yr, val], i) => {
        i === 0 ? ctx.moveTo(xPos(yr, W), yPos(val, H))
                : ctx.lineTo(xPos(yr, W), yPos(val, H));
      });
      ctx.stroke();

      // Точки докладов
      REPORTS.forEach((r, i) => {
        const cx = xPos(r.year, W), cy = yPos(r.co2, H);
        const isHov = hovered === i;
        ctx.beginPath();
        ctx.fillStyle = isHov ? ACCENT : BGCOL;
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 2.5;
        ctx.arc(cx, cy, isHov ? 7 : 5, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      });

      // Тултип
      closeBtn = null;
      if (tooltip) {
        const { x, y, report } = tooltip;
        const mobile = isMobileView();
        const bW = 230, pad = 14, lh = 19;
        ctx.font = `13px ${FONT}`;
        const bodyLines = wrapText(ctx, report.quote, bW - pad * 2);
        const bH = lh * (1 + bodyLines.length) + pad * 2 + 10;

        let bx, by;
        if (mobile) {
          // На мобилке — по центру над точкой
          const GAP = 16; // зазор между точкой и окном
          bx = x - bW / 2;
          if (bx < 6) bx = 6;
          if (bx + bW > W - 6) bx = W - bW - 6;
          by = y - GAP - bH;
          // если сверху не помещается — показываем под точкой
          if (by < 6) by = y + GAP;
          if (by + bH > H - 6) by = H - bH - 6;
        } else {
          bx = x + 18;
          if (bx + bW > W - 6) bx = x - bW - 18;
          by = y - bH / 2;
          if (by < 6) by = 6;
          if (by + bH > H - 6) by = H - bH - 6;
        }

        // Тень + фон
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 4;
        const r = 10;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bW - r, by); ctx.quadraticCurveTo(bx + bW, by, bx + bW, by + r);
        ctx.lineTo(bx + bW, by + bH - r); ctx.quadraticCurveTo(bx + bW, by + bH, bx + bW - r, by + bH);
        ctx.lineTo(bx + r, by + bH); ctx.quadraticCurveTo(bx, by + bH, bx, by + bH - r);
        ctx.lineTo(bx, by + r); ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Заголовок
        ctx.fillStyle = ACCENT;
        ctx.font = `bold 13px ${FONT}`;
        ctx.textAlign = 'left';
        const titleMaxW = mobile ? bW - pad * 2 - 18 : bW - pad * 2;
        ctx.fillText(report.label, bx + pad, by + pad + lh - 2, titleMaxW);

        // Крестик закрытия (только на мобилке/тач)
        if (mobile) {
          const cx = bx + bW - pad - 1;
          const cy = by + pad + 5;
          const s = 5; // полудлина штриха крестика
          ctx.strokeStyle = 'rgba(26,26,26,0.40)';
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s);
          ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s);
          ctx.stroke();
          ctx.lineCap = 'butt';
          closeBtn = { x: cx, y: cy, r: 16 }; // увеличенная зона тапа
        }

        // Разделитель
        const divY = by + pad + lh + 6;
        ctx.strokeStyle = 'rgba(26,26,26,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bx + pad, divY); ctx.lineTo(bx + bW - pad, divY); ctx.stroke();

        // Текст цитаты
        ctx.fillStyle = 'rgba(26,26,26,0.70)';
        ctx.font = `13px ${FONT}`;
        bodyLines.forEach((line, li) => {
          ctx.fillText(line, bx + pad, divY + lh * (li + 1) + 3);
        });
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const isMobile = window.innerWidth <= 767;
      logicalW = isMobile ? Math.max(800, canvas.parentElement.clientWidth) : Math.max(600, canvas.parentElement.clientWidth);
      logicalH = Math.round(logicalW * 0.46);
      canvas.width  = logicalW * dpr;
      canvas.height = logicalH * dpr;
      canvas.style.width  = logicalW + 'px';
      canvas.style.height = logicalH + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function getHovered(mx, my) {
      const W = logicalW, H = logicalH;
      for (let i = 0; i < REPORTS.length; i++) {
        const dx = mx - xPos(REPORTS[i].year, W);
        const dy = my - yPos(REPORTS[i].co2, H);
        if (Math.sqrt(dx * dx + dy * dy) < 22) return i;
      }
      return null;
    }

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left), my = (e.clientY - rect.top);
      const idx = getHovered(mx, my);
      if (idx !== hovered) {
        hovered = idx;
        if (idx !== null) {
          tooltip = { x: xPos(REPORTS[idx].year, logicalW), y: yPos(REPORTS[idx].co2, logicalH), report: REPORTS[idx] };
          canvas.style.cursor = 'pointer';
        } else {
          tooltip = null;
          canvas.style.cursor = 'default';
        }
        draw();
      }
    });

    canvas.addEventListener('mouseleave', () => {
      hovered = null; tooltip = null;
      canvas.style.cursor = 'default';
      draw();
    });

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      // координаты тапа в логических единицах (canvas может быть масштабированCSS)
      const mx = (touch.clientX - rect.left) * (logicalW / rect.width);
      const my = (touch.clientY - rect.top) * (logicalH / rect.height);

      // 1) тап по крестику — закрыть
      if (tooltip && closeBtn) {
        const dx = mx - closeBtn.x, dy = my - closeBtn.y;
        if (Math.sqrt(dx * dx + dy * dy) < closeBtn.r) {
          hovered = null; tooltip = null; draw();
          return;
        }
      }

      // 2) тап по точке — открыть/переключить
      const idx = getHovered(mx, my);
      if (idx !== null) {
        hovered = idx;
        tooltip = { x: xPos(REPORTS[idx].year, logicalW), y: yPos(REPORTS[idx].co2, logicalH), report: REPORTS[idx] };
        draw();
        return;
      }

      // 3) тап в любом другом месте схемы — закрыть
      if (tooltip) { hovered = null; tooltip = null; draw(); }
    }, { passive: false });

    document.addEventListener('touchstart', e => {
      if (!e.target.closest('#ipcc-chart')) { hovered = null; tooltip = null; draw(); }
    });

    window.addEventListener('resize', resize);
    resize();
  }

})();
