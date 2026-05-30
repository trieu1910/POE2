import type { ParsedSlot } from './types';

export function buildTradeList(slot: ParsedSlot): { mustHave: string[]; niceToHave: string[] } {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const a of slot.affixes) {
    const k = a.label.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(a.label);
  }
  return { mustHave: unique.slice(0, 3), niceToHave: unique.slice(3) };
}
