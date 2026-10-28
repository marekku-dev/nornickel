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
    '(?<=^|[\\s\\u00A0(«"„—])(' + escaped + ')[ \\t]+(?=[^\\s])',
    'gi'
  );

  // Дополнительно: инициалы и однобуквенные «А.», номера «№ 5», «г. 2024» и т.п.
  const RE_INITIAL = /(?<=^|[\s ])([А-ЯЁA-Z]\.)[ \t]+(?=[А-ЯЁA-Z])/g;
  const RE_NUMSIGN = /(№|§)[ \t]+(?=\d)/g;

  /* ─── Дефисные слова, которые нельзя рвать по дефису при переносе строки ───
     Меняем обычный дефис на неразрывный (‑). Список служебных — точечно
     расширяй здесь. Составные прилагательные («тёмно-синий») НЕ трогаем. */
  const HYPHEN_WORDS = [
    "из-за","из-под","по-над","по-за",
    "по-моему","по-твоему","по-нашему","по-вашему","по-своему",
    "по-русски","по-английски","по-другому","по-прежнему","по-настоящему","по-разному",
    "кое-что","кое-кто","кое-как","кое-где","кое-куда","кое-когда",
    "что-то","что-либо","что-нибудь","кто-то","кто-либо","кто-нибудь",
    "где-то","где-либо","где-нибудь","как-то","как-нибудь",
    "когда-то","когда-нибудь","почему-то","чей-то","чем-то",
    "всё-таки","все-таки","так-то","давным-давно","точь-в-точь",
  ];
  const escHyphen = HYPHEN_WORDS
    .map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("|");
  // Границы вручную (кириллический \b ненадёжен): не буква/цифра по краям
  const RE_HYPHEN = new RegExp(
    "(^|[^0-9A-Za-z\u0410-\u044f\u0401\u0451])(" + escHyphen + ")(?![0-9A-Za-z\u0410-\u044f\u0401\u0451])",
    "gi"
  );
  const NBHYPHEN = "‑";
  const NBSP = " "; // неразрывный пробел (надёжнее, чем литерал в коде)

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

  /* ─── Английская версия (<html lang="en">) — свои правила ───
     После коротких служебных слов, перед тире, между числом и единицей
     измерения и в инициалах ставим неразрывный пробел. */
  const IS_EN = document.documentElement.lang === 'en';
  const NBSP_EN = String.fromCharCode(160);   // не литерал — см. заметку про NBSP
  const EN_SHORT_WORDS = [
    // артикли и короткие предлоги
    'a','an','the','of','in','on','at','to','by','for','from','with','into','onto','per','via',
    // союзы и короткие служебные слова
    'and','or','but','nor','as','if','is','it','its','we','our','no','not',
  ];
  const EN_RE_SHORT = new RegExp(
    '(?<=^|[\\s\\u00A0(“‘"\'/—–])(' + EN_SHORT_WORDS.join('|') + ')[ \\t]+(?=[^\\s])',
    'gi'
  );
  // «word – next»: тире не должно начинать строку
  const EN_RE_DASH = /(?<=\S)[ \t]+(?=[–—](?:\s|$))/g;
  // число + единица/счётное слово: «1.5 °C», «70 %», «2 billion», «30 years», «No. 296»
  const EN_RE_NUM = /(\d)[ \t]+(?=(?:°|%|‰|ppm\b|million\b|billion\b|trillion\b|thousand\b|tonnes?\b|years?\b|decades?\b|days?\b|months?\b|hours?\b|countries\b|km\b|kg\b|GW\b|MW\b|kWh\b|BC\b|AD\b))/g;
  const EN_RE_NO = /\b(No\.|p\.|pp\.)[ \t]+(?=\d)/g;
  // инициалы: «A. M. Obukhov», «Yu. A. Izrael»
  const EN_RE_INITIAL = /(?<=^|[\s\u00A0])([A-Z][a-z]?\.)[ \t]+(?=[A-Z])/g;

  function fixHangingTextEn(str) {
    // Два прохода: соседние короткие слова («to the») — за один проход
    // благодаря lookbehind, второй — на всякий случай (идемпотентно).
    let out = str;
    for (let i = 0; i < 2; i++) {
      out = out
        .replace(EN_RE_SHORT,   (m, w) => w + NBSP_EN)
        .replace(EN_RE_INITIAL, (m, w) => w + NBSP_EN)
        .replace(EN_RE_NO,      (m, w) => w + NBSP_EN)
        .replace(EN_RE_NUM,     (m, d) => d + NBSP_EN)
        .replace(EN_RE_DASH,    NBSP_EN);
    }
    return out;
  }

  /* Чистая строковая версия — годится и для текста, которого ещё нет в DOM
     (например, текст тултипа перед вставкой). Идемпотентна. */
  function fixHangingText(str) {
    if (!str) return str;
    if (IS_EN) return fixHangingTextEn(str);
    return str
      .replace(RE,         (m, w) => w + NBSP)
      .replace(RE_INITIAL, (m, w) => w + NBSP)
      .replace(RE_NUMSIGN, (m, s)    => s + NBSP)
      // дефисные слова: обычный дефис → неразрывный (внутри слова)
      .replace(RE_HYPHEN,  (m, p, w) => p + w.replace(/-/g, NBHYPHEN));
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
