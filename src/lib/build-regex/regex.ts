import type { ParsedSlot, IngameRegex } from './types';
import { resolveToken } from './affix-map';
import { wrapSearch } from './wrap';

const META = /[.^$*+?()[\]{}|\\]/g;

/** Escape ký tự đặc biệt regex, giữ nguyên khoảng trắng. */
function escapeToken(t: string): string {
  return t.replace(META, '\\$&');
}

export function buildIngameRegex(slot: ParsedSlot, charLimit = 50): IngameRegex | null {
  if (slot.uniqueName) return null;
  if (slot.affixes.length === 0) return null;

  // Chừa 2 ký tự cho cặp ngoặc kép (luôn an toàn dù cuối cùng có bọc hay không).
  const inner = Math.max(1, charLimit - 2);

  const tokens: string[] = [];
  const included: string[] = [];
  const dropped: string[] = [];
  const warnings: string[] = [];

  for (const a of slot.affixes) {
    const resolved = resolveToken(a.key, a.label);
    const piece = escapeToken(resolved.token);
    if (tokens.includes(piece)) {
      // Token trùng — đã được token trước phủ; tính là "gồm" nhưng không nhồi thêm.
      included.push(a.label);
      if (resolved.confidence === 'low') warnings.push(a.label);
      continue;
    }
    const candidate = [...tokens, piece].join('|');

    if (candidate.length > inner && tokens.length > 0) {
      // Không nhét được — bỏ qua, vẫn thử các token ngắn hơn phía sau.
      dropped.push(a.label);
      continue;
    }

    tokens.push(piece);
    included.push(a.label);
    if (resolved.confidence === 'low') warnings.push(a.label);
  }

  const regex = wrapSearch(tokens.join('|'));
  return { regex, length: regex.length, included, dropped, warnings };
}
