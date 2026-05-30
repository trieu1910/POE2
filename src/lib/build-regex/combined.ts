import type { SlotResult } from './types';
import { resolveToken } from './affix-map';

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
  /** Nhãn affix đã gồm trong bản gọn. */
  included: string[];
  /** Nhãn affix bị cắt khỏi bản gọn (vẫn có trong bản đầy đủ). */
  dropped: string[];
  /** Nhãn affix có token "chưa chắc" (fallback). */
  warnings: string[];
}

/**
 * Gộp mọi affix của các ô KHÔNG phải unique thành MỘT regex "cân all":
 * dedupe theo token, stat được nhiều ô cần xếp trước. Trả về cả bản gọn
 * (vừa giới hạn ký tự) lẫn bản đầy đủ.
 */
export function buildCombined(results: SlotResult[], charLimit = 50): CombinedRegex {
  const map = new Map<string, { label: string; count: number; low: boolean }>();
  for (const r of results) {
    if (r.slot.uniqueName) continue; // unique mua theo tên, không quét vendor
    for (const a of r.slot.affixes) {
      const resolved = resolveToken(a.key, a.label);
      const piece = escapeToken(resolved.token);
      const cur = map.get(piece);
      if (cur) cur.count++;
      else map.set(piece, { label: a.label, count: 1, low: resolved.confidence === 'low' });
    }
  }

  // Sắp xếp: token được nhiều ô cần xếp trước (sort ổn định giữ thứ tự gặp).
  const entries = [...map.entries()].sort((a, b) => b[1].count - a[1].count);

  const full = entries.map((e) => e[0]).join('|');

  const compactTokens: string[] = [];
  const included: string[] = [];
  const dropped: string[] = [];
  const warnings: string[] = [];
  for (const [piece, info] of entries) {
    const candidate = [...compactTokens, piece].join('|');
    if (candidate.length > charLimit && compactTokens.length > 0) {
      dropped.push(info.label);
      continue;
    }
    compactTokens.push(piece);
    included.push(info.label);
    if (info.low) warnings.push(info.label);
  }
  const compact = compactTokens.join('|');

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
