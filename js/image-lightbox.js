/* =============================================================================
 * image-lightbox.js — зум-лайтбокс для картинок
 *
 * Любой элемент с атрибутом data-lightbox="<путь к большой картинке>" по клику
 * открывает полноэкранный оверлей на нативном <dialog> (showModal): фон
 * блокируется браузером, есть ::backdrop и закрытие по Escape — тот же подход,
 * что и у тултипов (js/tooltips.js).
 *
 * Зум:
 *   • колесо мыши / трекпад — зум к точке курсора
 *   • двойной клик / двойной тап — переключение 1× ↔ 2.5× к точке
 *   • pinch двумя пальцами — зум к центру жеста
 *   • перетаскивание (drag / один палец) при увеличении — панорамирование
 * Закрытие: крестик, клик по фону (когда не увеличено), Escape, свайп вниз.
 * ========================================================================== */
(function () {
  'use strict';

  var MIN_SCALE = 1;
  var MAX_SCALE = 6;
  var DBL_SCALE = 2.5;       // во сколько раз увеличивает двойной тап/клик

  var dlg, stage, img, hint;
  var scale = 1, tx = 0, ty = 0;     // текущий зум и сдвиг (px) изображения
  var natural = { w: 0, h: 0 };      // размеры картинки на экране при scale=1

  /* ─── Создаём <dialog> один раз ─── */
  function ensureNodes() {
    dlg = document.getElementById('image-lightbox');
    if (dlg && dlg.tagName !== 'DIALOG') { dlg.remove(); dlg = null; }
    if (dlg) return;

    dlg = document.createElement('dialog');
    dlg.id = 'image-lightbox';
    dlg.className = 'lightbox';
    dlg.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Закрыть">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
      '</button>' +
      '<div class="lightbox__stage">' +
        '<img class="lightbox__img" alt="">' +
      '</div>' +
      '<div class="lightbox__hint">Колесо, двойной тап или щипок — приблизить</div>';
    document.body.appendChild(dlg);

    stage = dlg.querySelector('.lightbox__stage');
    img   = dlg.querySelector('.lightbox__img');
    hint  = dlg.querySelector('.lightbox__hint');

    bindEvents();
  }

  /* ─── Применяем зум/сдвиг ─── */
  function apply() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    stage.classList.toggle('is-zoomed', scale > 1.01);
  }

  function markInteracted() { dlg.classList.add('is-interacted'); }

  /* Ограничиваем сдвиг, чтобы картинку нельзя было «утащить» за пределы экрана */
  function clampPan() {
    var sw = natural.w * scale;
    var sh = natural.h * scale;
    var maxX = Math.max(0, (sw - stage.clientWidth) / 2);
    var maxY = Math.max(0, (sh - stage.clientHeight) / 2);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  }

  /* Зум к точке (cx, cy) в координатах stage */
  function zoomTo(newScale, cx, cy) {
    newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    var rect = stage.getBoundingClientRect();
    // координаты точки относительно центра stage (origin для transform — центр)
    var ox = cx - rect.left - rect.width / 2;
    var oy = cy - rect.top - rect.height / 2;
    var ratio = newScale / scale;
    // сдвигаем так, чтобы точка под курсором/пальцем осталась на месте
    tx = ox - (ox - tx) * ratio;
    ty = oy - (oy - ty) * ratio;
    scale = newScale;
    if (scale <= MIN_SCALE + 0.001) { scale = 1; tx = 0; ty = 0; }
    clampPan();
    apply();
    markInteracted();
  }

  function reset() { scale = 1; tx = 0; ty = 0; apply(); }

  /* Экранный размер картинки при scale=1 (object-fit: contain в пределах stage).
   * Считаем из naturalWidth/Height + размеров stage — это не зависит от того,
   * успел ли браузер отрисовать <img> (getBoundingClientRect мог бы вернуть 0,
   * если картинка из кэша и замер случился до показа диалога). */
  function measure() {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var sw = stage.clientWidth, sh = stage.clientHeight;
    if (!iw || !ih || !sw || !sh) {
      var r = img.getBoundingClientRect();   // фолбэк
      natural.w = r.width; natural.h = r.height;
      return;
    }
    var fit = Math.min(sw / iw, sh / ih);     // contain
    natural.w = iw * fit;
    natural.h = ih * fit;
    clampPan();
    apply();
  }

  /* ─── Открытие / закрытие ─── */
  function open(src, alt) {
    ensureNodes();
    reset();
    dlg.classList.remove('is-interacted');
    img.alt = alt || '';
    img.src = src;

    if (!dlg.open) dlg.showModal();
    // Замеряем уже после показа диалога, когда stage получил размеры.
    var afterShow = function () {
      if (img.complete && img.naturalWidth) measure();
      else img.addEventListener('load', measure, { once: true });
    };
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        dlg.classList.add('is-visible');
        afterShow();
      });
    });
  }

  function close() {
    dlg.classList.remove('is-visible');
    var done = function () {
      dlg.removeEventListener('transitionend', done);
      if (dlg.open) dlg.close();
      img.src = '';
    };
    dlg.addEventListener('transitionend', done);
    // фолбэк, если transitionend не придёт
    setTimeout(function () { if (dlg.open && !dlg.classList.contains('is-visible')) done(); }, 320);
  }

  /* ─── Жесты ─── */
  function bindEvents() {
    dlg.querySelector('.lightbox__close').addEventListener('click', close);

    // Escape (нативное закрытие <dialog>) — синхронизируем состояние
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });

    // Колесо / трекпад
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      zoomTo(scale * factor, e.clientX, e.clientY);
    }, { passive: false });

    // Двойной клик мышью
    stage.addEventListener('dblclick', function (e) {
      e.preventDefault();
      zoomTo(scale > 1.01 ? 1 : DBL_SCALE, e.clientX, e.clientY);
    });

    // Pointer-события: drag-пан + pinch + двойной тап + свайп-закрытие
    var pointers = new Map();
    var lastDist = 0, lastMid = null;
    var panStart = null;
    var lastTap = 0, lastTapXY = null;
    var swipeStartY = 0, swiping = false;

    stage.addEventListener('pointerdown', function (e) {
      stage.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 1) {
        panStart = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
        swipeStartY = e.clientY;
        swiping = (scale <= 1.01);   // свайп-закрытие только когда не увеличено
        // двойной тап
        var now = Date.now();
        if (now - lastTap < 300 && lastTapXY &&
            Math.hypot(e.clientX - lastTapXY.x, e.clientY - lastTapXY.y) < 30) {
          zoomTo(scale > 1.01 ? 1 : DBL_SCALE, e.clientX, e.clientY);
          lastTap = 0;
        } else {
          lastTap = now;
          lastTapXY = { x: e.clientX, y: e.clientY };
        }
      } else if (pointers.size === 2) {
        swiping = false;
        var pts = Array.from(pointers.values());
        lastDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        lastMid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      }
    });

    stage.addEventListener('pointermove', function (e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2) {
        // pinch
        var pts = Array.from(pointers.values());
        var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        var mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        if (lastDist > 0) zoomTo(scale * (dist / lastDist), mid.x, mid.y);
        lastDist = dist;
        lastMid = mid;
      } else if (pointers.size === 1 && panStart) {
        var dx = e.clientX - panStart.x;
        var dy = e.clientY - panStart.y;
        if (scale > 1.01) {
          // пан увеличенной картинки
          stage.classList.add('is-panning');
          tx = panStart.tx + dx;
          ty = panStart.ty + dy;
          clampPan();
          apply();
        } else if (swiping && dy > 0) {
          // свайп вниз для закрытия — слегка тянем фон по прозрачности
          var p = Math.min(1, dy / 240);
          dlg.style.opacity = String(1 - p * 0.6);
        }
      }
    });

    function endPointer(e) {
      pointers.delete(e.pointerId);
      stage.classList.remove('is-panning');

      if (pointers.size < 2) lastDist = 0;

      if (pointers.size === 0) {
        // завершение свайпа-закрытия
        if (swiping && scale <= 1.01) {
          var dy = e.clientY - swipeStartY;
          if (dy > 120) { dlg.style.opacity = ''; close(); return; }
        }
        dlg.style.opacity = '';
        panStart = null;
      } else if (pointers.size === 1) {
        // остался один палец — продолжаем как пан
        var only = Array.from(pointers.values())[0];
        panStart = { x: only.x, y: only.y, tx: tx, ty: ty };
      }
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);

    // Клик по фону stage (не по картинке) при отсутствии зума — закрыть
    stage.addEventListener('click', function (e) {
      if (e.target === stage && scale <= 1.01) close();
    });

    // Пересчёт границ при повороте экрана / ресайзе
    window.addEventListener('resize', function () {
      if (dlg.open) measure();
    });
  }

  /* ─── Делегирование клика по триггерам ─── */
  function init() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-lightbox]');
      if (!trigger) return;
      e.preventDefault();
      var src = trigger.getAttribute('data-lightbox');
      var innerImg = trigger.querySelector('img');
      open(src, innerImg ? innerImg.alt : '');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
