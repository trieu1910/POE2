import type { SlotResult } from './types';
import { resolveToken, GENERIC_KEYS } from './affix-map';
import { baseAnchor } from './regex';
import { wrapSearch } from './wrap';

const META = /[.^$*+?()[\]{}|\\]/g;
function escapeToken(t: string): string {
  return t.replace(META, '\\$&');
}

export interface CombinedRegex {
  /** Bản gọn, gói trong giới hạn ký tự (dán vào ô search trong game). */
  compact: string;
  compactLength: number;
  /** Bản đầy đủ — mọi token, không cắt (dùng nơi không giới hạn). */
  full: string;
  fullLength: number;
  /** Nhãn đã gồm trong bản gọn. */
  included: string[];
  /** Nhãn bị cắt khỏi bản gọn (vẫn có trong bản đầy đủ). */
  dropped: string[];
  /** Nhãn có token "chưa chắc" (fallback). */
  warnings: string[];
}

/**
 * "Dòng tổng" kiểu các pro share để QUÉT NHANH khi farm/leveling:
 * LOẠI VŨ KHÍ của build + các stat đặc trưng, nối bằng | (HOẶC).
 * Vd: "sbo|ent sp|to att". Cố tình rộng (lưới vớt) — không phải lọc tinh.
 * Bỏ stat phổ thông (Life/Res) cho bớt nhiễu. Trả về cả bản gọn lẫn đầy đủ.
 */
export function buildCombined(results: SlotResult[], charLimit = 50): CombinedRegex {
  // 1) Mỏ neo loại vũ khí (đứng đầu, giống "sbo" trong ví dụ pro).
  const anchors: string[] = [];
  for (const r of results) {
    if (r.slot.uniqueName) continue;
    if (!/Weapon/i.test(r.slot.inventoryId)) continue;
    const a = escapeToken(baseAnchor(r.slot.base));
    if (a && !anchors.includes(a)) anchors.push(a);
  }

  // 2) Stat đặc trưng (bỏ phổ thông), xếp theo tần suất.
  const map = new Map<string, { label: string; count: number; low: boolean }>();
  for (const r of results) {
    if (r.slot.uniqueName) continue;
    for (const a of r.slot.affixes) {
      if (GENERIC_KEYS.has(a.key)) continue;
      const resolved = resolveToken(a.key, a.label);
      const piece = escapeToken(resolved.token);
      const cur = map.get(piece);
      if (cur) cur.count++;
      else map.set(piece, { label: a.label, count: 1, low: resolved.confidence === 'low' });
    }
  }
  const affixEntries = [...map.entries()].sort((a, b) => b[1].count - a[1].count);

  // 3) Gộp: mỏ neo vũ khí trước, rồi stat; dedupe.
  const ordered: { piece: string; label: string; low: boolean }[] = [];
  const seen = new Set<string>();
  for (const a of anchors) {
    if (seen.has(a)) continue;
    seen.add(a);
    ordered.push({ piece: a, label: `${a} (loại vũ khí)`, low: false });
  }
  for (const [piece, info] of affixEntries) {
    if (seen.has(piece)) continue;
    seen.add(piece);
    ordered.push({ piece, label: info.label, low: info.low });
  }

  const full = wrapSearch(ordered.map((o) => o.piece).join('|'));

  // Chừa 2 ký tự cho cặp ngoặc kép.
  const inner = Math.max(1, charLimit - 2);
  const compactTokens: string[] = [];
  const included: string[] = [];
  const dropped: string[] = [];
  const warnings: string[] = [];
  for (const o of ordered) {
    const candidate = [...compactTokens, o.piece].join('|');
    if (candidate.length > inner && compactTokens.length > 0) {
      dropped.push(o.label);
      continue;
    }
    compactTokens.push(o.piece);
    included.push(o.label);
    if (o.low) warnings.push(o.label);
  }
  const compact = wrapSearch(compactTokens.join('|'));

  return {
    compact,
    compactLength: compact.length,
    full,
    fullLength: full.length,
    included,
    dropped,
    warnings,
  };
}
