import type { ParsedSlot, IngameRegex } from './types';
import { resolveToken, GENERIC_KEYS } from './affix-map';

const META = /[.^$*+?()[\]{}|\\]/g;

/** Escape ký tự đặc biệt regex, giữ nguyên khoảng trắng. */
function escapeToken(t: string): string {
  return t.replace(META, '\\$&');
}

/** Một "cụm" trong logic VÀ luôn bọc ngoặc kép, ngăn cách nhau bằng dấu cách. */
function group(piece: string): string {
  return `"${piece}"`;
}

/**
 * Từ cuối của tên base thường là "họ" món đồ (vd "Twin Bow" → Bow,
 * "Dragonscale Boots" → Boots, "Prismatic Ring" → Ring) → dùng làm mỏ neo
 * khóa regex vào đúng LOẠI trang bị, để không sáng nhầm món khác.
 */
export function baseAnchor(base: string): string {
  const words = base.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  return words[words.length - 1].replace(/[^A-Za-z]/g, '');
}

/** Số stat (ngoài mỏ neo loại đồ) buộc khớp cùng lúc — "gắt vừa". */
const REQUIRE = 2;

/**
 * Regex lọc GẮT cho 1 ô: khóa theo LOẠI trang bị + buộc có {REQUIRE} stat chính
 * cùng lúc. Mỗi phần là một cụm "..." ngăn nhau bằng dấu cách (logic VÀ trong game).
 * Ưu tiên stat đặc trưng trước, đẩy stat phổ thông (Life/Res…) xuống cuối.
 */
export function buildIngameRegex(slot: ParsedSlot, charLimit = 50): IngameRegex | null {
  if (slot.uniqueName) return null;
  if (slot.affixes.length === 0) return null;

  const anchor = baseAnchor(slot.base);
  const baseGroups = anchor ? [group(escapeToken(anchor))] : [];

  // Đặc trưng trước, phổ thông sau (sort ổn định giữ thứ tự ưu tiên gốc).
  const ordered = [
    ...slot.affixes.filter((a) => !GENERIC_KEYS.has(a.key)),
    ...slot.affixes.filter((a) => GENERIC_KEYS.has(a.key)),
  ];

  const chosen: string[] = [];
  const seen = new Set<string>();
  const included: string[] = [];
  const dropped: string[] = [];
  const warnings: string[] = [];

  for (const a of ordered) {
    const resolved = resolveToken(a.key, a.label);
    const piece = escapeToken(resolved.token);

    if (seen.has(piece)) {
      if (chosen.includes(piece)) included.push(a.label);
      continue;
    }
    seen.add(piece);

    if (chosen.length >= REQUIRE) {
      dropped.push(a.label);
      continue;
    }

    const candidate = [...baseGroups, ...chosen.map(group), group(piece)].join(' ');
    if (candidate.length > charLimit && chosen.length > 0) {
      dropped.push(a.label);
      continue;
    }

    chosen.push(piece);
    included.push(a.label);
    if (resolved.confidence === 'low') warnings.push(a.label);
  }

  const regex = [...baseGroups, ...chosen.map(group)].join(' ');
  return { regex, length: regex.length, included, dropped, warnings };
}
