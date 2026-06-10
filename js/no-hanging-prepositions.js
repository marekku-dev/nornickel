/**
 * no-hanging-prepositions.js
 * Убирает «висячие предлоги»: вставляет неразрывный пробел ( ) после
 * коротких слов (предлоги, союзы, частицы, инициалы), чтобы они не отрывались
 * от следующего слова при переносе строки.
 *
 * Runtime-решение: работает в браузере при загрузке страницы.
 * Исходный HTML НЕ меняется — правки живут только в DOM.
 *
 * Подключается из components.js → initAll() вызовом fixHangingPrepositions().
 * При желании можно подключить и отдельным <script> — тогда сработает
 * автоматически по DOMContentLoaded (см. конец файла).
 */
(function (global) {
  'use strict';

  /* ─── Короткие слова, после которых нужен неразрывный пробел ─── */
  const SHORT_WORDS = [
    // предлоги
    'в','во','на','по','за','из','от','до','об','обо','над','под','при','про',
    'без','для','из-за','из-под','со','ко','к','с','у','о',
    // союзы
    'и','а','но','да','или','ни','не','же','бы','ли','то','что','как','так',
    'чем','если','хотя','когда',
    // частицы / местоимения / прочее
    'её','его','их','всё','все','это','эта','этот','эти','тот','та','те',
  ];

  /* Регэксп: (начало или пробел)(короткое слово)(пробел) — заменяем хвостовой
     пробел на  . \b на кириллице ненадёжен, поэтому границы строим вручную. */
  const escaped = SHORT_WORDS
    .map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
    .join('|');
  // (^|пробел-разделитель) + слово + обычный пробел, после которого идёт буква/цифра
  const RE = new RegExp(
    '(^|[\\s\\u00A0(«"„—])(' + escaped + ')[ \\t]+(?=[^\\s])',
    'gi'
  );

  // Дополнительно: инициалы и однобуквенные «А.», номера «№ 5», «г. 2024» и т.п.
  const RE_INITIAL = /(^|[\s ])([А-ЯЁA-Z]\.)[ \t]+(?=[А-ЯЁA-Z])/g;
  const RE_NUMSIGN = /(№|§)[ \t]+(?=\d)/g;

  /* ─── Зоны, которые НЕ трогаем ─── */
  const SKIP_TAGS = new Set([
    'SCRIPT','STYLE','CODE','PRE','KBD','SAMP','TEXTAREA',
    'SVG','MATH','NOSCRIPT','OPTION','SELECT','INPUT',
  ]);

  function shouldSkip(node) {
    for (let el = node.parentNode; el; el = el.parentNode) {
      if (el.nodeType !== 1) continue;            // не элемент
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.isContentEditable) return true;       // не трогаем редактируемое
      if (el.classList && el.classList.contains('no-nbsp')) return true;
    }
    return false;
  }

  /* Чистая строковая версия — годится и для текста, которого ещё нет в DOM
     (например, текст тултипа перед вставкой). Идемпотентна. */
  function fixHangingText(str) {
    if (!str || str.indexOf(" ") === -1) return str;
    return str
      .replace(RE,         (m, p, w) => p + w + " ")
      .replace(RE_INITIAL, (m, p, w) => p + w + " ")
      .replace(RE_NUMSIGN, (m, s)    => s + " ");
  }

  function fixTextNode(node) {
    const before = node.nodeValue;
    const after  = fixHangingText(before);
    if (after !== before) node.nodeValue = after;
  }

  /* ─── Обход всех текстовых узлов в корне ─── */
  function fixHangingPrepositions(root) {
    root = root || document.body;
    if (!root) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim())
            return NodeFilter.FILTER_REJECT;
          if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(fixTextNode);
  }

  /* ─── Экспорт ─── */
  global.fixHangingPrepositions = fixHangingPrepositions; // правит DOM
  global.fixHangingText = fixHangingText;                 // правит строку

  /* Автозапуск, если файл подключили отдельным <script> и components.js
     ещё не вызвал функцию сам. Безопасно запускать дважды (идемпотентно:
       уже не матчится как обычный пробел в RE). */
  if (document.currentScript &&
      !document.currentScript.dataset.manual) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => fixHangingPrepositions());
    } else {
      fixHangingPrepositions();
    }
  }
})(window);
