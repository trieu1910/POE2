import type { NormalizedAffix } from './types';

const SNAKE = /^[a-z0-9]+(_[a-z0-9+%]+)+$/i;

/** Làm sạch markup/placeholder, trả về chuỗi người-đọc. */
function clean(input: string): string {
  let t = input.trim();
  t = t.replace(/\((?:local)\)/gi, '');                 // (local) — bỏ trước khi test snake_case
  t = t.replace(/\(\d+(?:\.\d+)?-\d+(?:\.\d+)?\)/g, ''); // (70-100)
  t = t.trim();
  if (SNAKE.test(t)) {
    t = t
      .replace(/_/g, ' ')
      .replace(/\s*\+\s*%/g, ' %')
      .replace(/\s*\+/g, '');
  }
  t = t.replace(/[#%]/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

/** Đưa về khóa chuẩn: lowercase, bỏ % và +, gộp các biến thể added-damage. */
function canonicalize(cleaned: string): string {
  const k = cleaned
    .toLowerCase()
    .replace(/%/g, '')
    .replace(/\+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const m =
    k.match(/adds?\s+to\s+(physical|cold|fire|lightning|chaos)\s+damage/) ??
    k.match(/(?:minimum|maximum)\s+added\s+(physical|cold|fire|lightning|chaos)\s+damage/) ??
    k.match(/added\s+(physical|cold|fire|lightning|chaos)\s+damage/);
  if (m) return `added ${m[1]} damage`;

  return k;
}

export function normalizeAffix(raw: string): NormalizedAffix {
  const cleaned = clean(raw);
  return { raw, key: canonicalize(cleaned), label: cleaned };
}
