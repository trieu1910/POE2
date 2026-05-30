import { describe, it, expect } from 'vitest';
import { buildTradeList } from './trade';
import type { ParsedSlot, NormalizedAffix } from './types';

function affix(label: string): NormalizedAffix {
  return { raw: label, key: label.toLowerCase(), label };
}

const slot = (labels: string[]): ParsedSlot => ({
  inventoryId: 'X',
  base: 'Base',
  levelInterval: [1, 100],
  affixes: labels.map(affix),
});

describe('buildTradeList', () => {
  it('3 dòng đầu là bắt buộc, còn lại nên có', () => {
    const r = buildTradeList(slot(['A', 'B', 'C', 'D', 'E']));
    expect(r.mustHave).toEqual(['A', 'B', 'C']);
    expect(r.niceToHave).toEqual(['D', 'E']);
  });

  it('gộp nhãn trùng (vd min/max added damage)', () => {
    const r = buildTradeList(slot(['Adds to Physical Damage', 'Adds to Physical Damage', 'to maximum Life']));
    expect([...r.mustHave, ...r.niceToHave]).toEqual(['Adds to Physical Damage', 'to maximum Life']);
  });
});
