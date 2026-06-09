#!/usr/bin/env node
/**
 * fix-nbsp.js
 * Ставит неразрывный пробел ПОСЛЕ короткого слова (предлога, союза, частицы),
 * чтобы оно не отрывалось от следующего слова при переносе строки.
 *
 * Пример: «в лесу» → «в&nbsp;лесу»
 *
 * Использование: node fix-nbsp.js
 */

const fs   = require('fs');
const path = require('path');

// Короткие слова, после которых ставим &nbsp;
const SHORT_WORDS = [
  // предлоги
  'в','во','на','по','за','из','от','до','об','обо','над','под','при','про','без','для','из-за','из-под','со','ко',
  // союзы
  'и','а','но','да','или','ни','не','же','бы','ли','то','что','как','так','чем','если','хотя','когда',
  // частицы / местоимения
  'её','его','их','всё','все','это','эта','этот','эти','тот','та','те',
];

const dir = '/sessions/vibrant-jolly-allen/mnt/NN';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const wordPattern = SHORT_WORDS.map(w => w.replace(/-/g, '\\-')).join('|');

// Шаг 1: откатить прошлые неправильные замены (&nbsp;слово → слово)
// Шаг 2: расставить правильные (слово&nbsp;)
let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Откат старых замен: &nbsp;предлог → пробел+предлог
  content = content.replace(
    new RegExp('&nbsp;(' + wordPattern + ')(\\s)', 'gi'),
    (m, word, after) => ' ' + word + after
  );

  let fileFixed = 0;

  // Правильная замена: пробел после предлога → &nbsp;
  const result = content.replace(/>([^<]+)</g, (match, text) => {
    if (!text.trim()) return match;

    const fixed = text.replace(
      new RegExp('(\\s)(' + wordPattern + ')(\\s)', 'gi'),
      (m, before, word, after) => {
        fileFixed++;
        return before + word + '&nbsp;';
      }
    );
    return '>' + fixed + '<';
  });

  fs.writeFileSync(filePath, result, 'utf8');
  if (fileFixed > 0) {
    console.log(`${file}: исправлено ${fileFixed} мест`);
    totalFixed += fileFixed;
  } else {
    console.log(`${file}: всё чисто`);
  }
});

console.log(`\nИтого: ${totalFixed} замен в ${files.length} файлах`);
