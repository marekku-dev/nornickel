#!/usr/bin/env node
/**
 * fix-nbsp.js
 * Заменяет обычный пробел перед короткими словами (предлоги, союзы, частицы)
 * на неразрывный пробел (&nbsp;) во всех HTML-файлах проекта.
 *
 * Использование: node fix-nbsp.js
 */

const fs   = require('fs');
const path = require('path');

// Короткие слова, перед которыми ставим &nbsp;
const SHORT_WORDS = [
  // предлоги
  'в','во','на','по','за','из','от','до','об','обо','над','под','при','про','без','для','из-за','из-под','со','ко',
  // союзы
  'и','а','но','да','или','ни','не','же','бы','ли','то','что','как','так','чем','если','хотя','когда',
  // частицы / местоимения
  'её','его','их','всё','все','это','эта','этот','эти','тот','та','те',
];

// Найти все HTML-файлы в директории
const dir = '/sessions/vibrant-jolly-allen/mnt/NN';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const wordPattern = SHORT_WORDS.map(w => w.replace(/-/g, '\\-')).join('|');

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = 0;

  // Обрабатываем только текстовые узлы — между тегами > ... <
  // Не трогаем атрибуты и содержимое тегов
  const result = content.replace(/>([^<]+)</g, (match, text) => {
    if (!text.trim()) return match;

    const fixed = text.replace(
      new RegExp('(\\s)(' + wordPattern + ')(\\s)', 'gi'),
      (m, before, word, after) => {
        fileFixed++;
        // &nbsp; перед словом, обычный пробел после
        return '&nbsp;' + word + after;
      }
    );
    return '>' + fixed + '<';
  });

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`${file}: исправлено ${fileFixed} мест`);
    totalFixed += fileFixed;
  } else {
    console.log(`${file}: всё чисто`);
  }
});

console.log(`\nИтого: ${totalFixed} замен в ${files.length} файлах`);
