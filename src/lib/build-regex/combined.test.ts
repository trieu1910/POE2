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

describe('buildCombined — quét thô', () => {
  it('gom + dedupe, bỏ stat phổ thông (Life), stat nhiều ô xếp trước', () => {
    const r = buildCombined(
      [
        res({
          affixes: [
            aff('to maximum life', 'to maximum Life'), // phổ thông → loại
            aff('increased evasion rating', 'increased Evasion Rating'),
            aff('to spirit', 'to Spirit'),
          ],
        }),
        res({ affixes: [aff('increased evasion rating', 'increased Evasion Rating')] }),
      ],
      50,
    );
    expect(r.full).toBe('Eva|Spiri'); // Eva (2 ô) trước; Life bị loại; không space → không bọc ngoặc
  });

  it('bỏ qua ô unique và stat phổ thông', () => {
    const r = buildCombined(
      [
        res({ uniqueName: 'Foo', affixes: [aff('to spirit', 'to Spirit')] }),
        res({ affixes: [aff('to maximum life', 'to maximum Life'), aff('to spirit', 'to Spirit')] }),
      ],
      50,
    );
    expect(r.full).toBe('Spiri');
  });

  it('mỏ neo loại vũ khí (từ ô Weapon) đứng đầu dòng tổng', () => {
    const r = buildCombined(
      [
        res({ inventoryId: 'Weapon1', base: 'Twin Bow', affixes: [aff('added physical damage', 'Adds Physical Damage')] }),
        res({ inventoryId: 'Boots1', base: 'Dragonscale Boots', affixes: [aff('increased movement speed', 'increased Movement Speed')] }),
      ],
      50,
    );
    expect(r.full).toBe('Bow|Physic|vement'); // Bow (loại vũ khí) đứng đầu
  });

  it('compact tôn trọng giới hạn ký tự; full thì không; có space → bọc ngoặc', () => {
    const r = buildCombined(
      [
        res({
          affixes: [
            aff('added physical damage', 'Adds Physical Damage'),
            aff('increased critical hit chance', 'increased Critical Hit Chance'),
            aff('to spirit', 'to Spirit'),
          ],
        }),
      ],
      12,
    );
    expect(r.compact).toBe('Physic');
    expect(r.dropped.length).toBe(2);
    expect(r.full).toBe('"Physic|Hit Cha|Spiri"');
    expect(r.fullLength).toBeGreaterThan(r.compactLength);
  });
});
