import type { ParsedSlot, IngameRegex } from './types';
import { resolveToken } from './affix-map';

const META = /[.^$*+?()[\]{}|\\]/g;

/** Escape ký tự đặc biệt regex, giữ nguyên khoảng trắng. */
function escapeToken(t: string): string {
  return t.replace(META, '\\$&');
}

export function buildIngameRegex(slot: ParsedSlot, charLimit = 50): IngameRegex | null {
  if (slot.uniqueName) return null;
  if (slot.affixes.length === 0) return null;

  const tokens: string[] = [];
  const included: string[] = [];
  const dropped: string[] = [];
  const warnings: string[] = [];

  for (const a of slot.affixes) {
    const resolved = resolveToken(a.key, a.label);
    const piece = escapeToken(resolved.token);
    const candidate = [...tokens, piece].join('|');

    if (candidate.length > charLimit && tokens.length > 0) {
      // Không nhét được — bỏ qua, vẫn thử các token ngắn hơn phía sau.
      dropped.push(a.label);
      continue;
    }

    tokens.push(piece);
    included.push(a.label);
    if (resolved.confidence === 'low') warnings.push(a.label);
  }

  const regex = tokens.join('|');
  return { regex, length: regex.length, included, dropped, warnings };
}
