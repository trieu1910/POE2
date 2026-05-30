import { describe, it, expect } from 'vitest';
import { buildCombined } from './combined';
import type { SlotResult, ParsedSlot, NormalizedAffix } from './types';

function aff(key: string, label: string): NormalizedAffix {
  return { raw: label, key, label };
}

function res(over: Partial<ParsedSlot>): SlotResult {
  const slot: ParsedSlot = { inventoryId: 'X', base: 'B', levelInterval: [1, 100], affixes: [], ...over };
  return { slot, ingameRegex: null, trade: { mustHave: [], niceToHave: [] } };
}

describe('buildCombined', () => {
  it('gom + dedupe token toàn build, stat nhiều ô cần xếp trước', () => {
    const r = buildCombined(
      [
        res({ affixes: [aff('to maximum life', 'to maximum Life'), aff('increased evasion rating', 'increased Evasion Rating')] }),
        res({ affixes: [aff('to maximum life', 'to maximum Life'), aff('to spirit', 'to Spirit')] }),
      ],
      50,
    );
    expect(r.full).toBe('imum L|Eva|Spiri'); // Life xuất hiện 2 ô → đứng đầu; dedupe còn 1
  });

  it('bỏ qua ô đồ unique', () => {
    const r = buildCombined(
      [
        res({ uniqueName: 'Foo', affixes: [aff('to maximum life', 'to maximum Life')] }),
        res({ affixes: [aff('to spirit', 'to Spirit')] }),
      ],
      50,
    );
    expect(r.full).toBe('Spiri');
  });

  it('compact tôn trọng giới hạn ký tự; full thì không', () => {
    const r = buildCombined(
      [
        res({
          affixes: [
            aff('to maximum life', 'to maximum Life'),
            aff('increased evasion rating', 'increased Evasion Rating'),
            aff('to spirit', 'to Spirit'),
          ],
        }),
      ],
      8,
    );
    expect(r.compact).toBe('imum L');
    expect(r.dropped.length).toBe(2);
    expect(r.fullLength).toBeGreaterThan(r.compactLength);
  });
});
