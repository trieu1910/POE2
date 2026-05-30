import { describe, it, expect } from 'vitest';
import { buildIngameRegex } from './regex';
import type { ParsedSlot, NormalizedAffix } from './types';

function affix(key: string, label: string): NormalizedAffix {
  return { raw: label, key, label };
}

function slot(over: Partial<ParsedSlot>): ParsedSlot {
  return { inventoryId: 'X', base: 'Base', levelInterval: [1, 100], affixes: [], ...over };
}

describe('buildIngameRegex — lọc gắt (VÀ 2 stat, đặc trưng trước)', () => {
  it('VÀ 2 stat chính: mỗi cụm bọc ngoặc, ngăn nhau bằng dấu cách', () => {
    const r = buildIngameRegex(
      slot({
        affixes: [
          affix('added physical damage', 'Adds Physical Damage'),
          affix('increased critical hit chance', 'increased Critical Hit Chance'),
        ],
      }),
    );
    expect(r!.regex).toBe('"Physic" "Hit Cha"');
    expect(r!.included).toEqual(['Adds Physical Damage', 'increased Critical Hit Chance']);
  });

  it('ưu tiên stat đặc trưng, đẩy stat phổ thông (Life) ra khỏi top-2', () => {
    const r = buildIngameRegex(
      slot({
        affixes: [
          affix('to maximum life', 'to maximum Life'), // phổ thông
          affix('added physical damage', 'Adds Physical Damage'),
          affix('increased critical hit chance', 'increased Critical Hit Chance'),
        ],
      }),
    );
    expect(r!.regex).toBe('"Physic" "Hit Cha"');
    expect(r!.dropped).toContain('to maximum Life');
  });

  it('chỉ có 1 stat → ra đúng 1 cụm', () => {
    const r = buildIngameRegex(slot({ affixes: [affix('increased movement speed', 'increased Movement Speed')] }));
    expect(r!.regex).toBe('"vement"');
  });

  it('gộp 2 dòng cùng stat thành 1, lấy stat kế tiếp cho đủ 2', () => {
    const r = buildIngameRegex(
      slot({
        affixes: [
          affix('added physical damage', 'Adds Physical Damage'),
          affix('added physical damage', 'Adds Physical Damage'),
          affix('increased critical hit chance', 'increased Critical Hit Chance'),
        ],
      }),
    );
    expect(r!.regex).toBe('"Physic" "Hit Cha"');
  });

  it('token fallback bị đánh cờ ⚠', () => {
    const r = buildIngameRegex(slot({ affixes: [affix('some weird stat', 'some weird stat')] }));
    expect(r!.warnings).toContain('some weird stat');
  });

  it('null cho đồ unique và khi không có affix', () => {
    expect(buildIngameRegex(slot({ uniqueName: 'Foo' }))).toBeNull();
    expect(buildIngameRegex(slot({ affixes: [] }))).toBeNull();
  });
});
