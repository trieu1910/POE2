import { describe, it, expect } from 'vitest';
import { buildIngameRegex } from './regex';
import type { ParsedSlot, NormalizedAffix } from './types';

function affix(key: string, label: string): NormalizedAffix {
  return { raw: label, key, label };
}

function slot(over: Partial<ParsedSlot>): ParsedSlot {
  return {
    inventoryId: 'X',
    base: 'Base',
    levelInterval: [1, 100],
    affixes: [],
    ...over,
  };
}

describe('buildIngameRegex', () => {
  it('nối token bằng | theo thứ tự ưu tiên', () => {
    const r = buildIngameRegex(
      slot({
        affixes: [
          affix('to maximum life', 'to maximum Life'),
          affix('increased evasion rating', 'increased Evasion Rating'),
        ],
      }),
      50,
    );
    expect(r).not.toBeNull();
    expect(r!.regex).toBe('imum L|Eva');
    expect(r!.length).toBe('imum L|Eva'.length);
    expect(r!.included).toHaveLength(2);
    expect(r!.dropped).toHaveLength(0);
  });

  it('bỏ affix vượt giới hạn ký tự', () => {
    const r = buildIngameRegex(
      slot({
        affixes: [
          affix('to maximum life', 'to maximum Life'),
          affix('increased evasion rating', 'increased Evasion Rating'),
          affix('to spirit', 'to Spirit'),
        ],
      }),
      8,
    );
    expect(r!.included).toEqual(['to maximum Life']);
    expect(r!.dropped.length).toBe(2);
  });

  it('đánh cờ warning cho token fallback', () => {
    const r = buildIngameRegex(
      slot({ affixes: [affix('some unmapped thing', 'some unmapped thing')] }),
      50,
    );
    expect(r!.warnings).toContain('some unmapped thing');
  });

  it('trả null cho đồ unique', () => {
    expect(buildIngameRegex(slot({ uniqueName: 'Foo' }), 50)).toBeNull();
  });

  it('trả null khi không có affix', () => {
    expect(buildIngameRegex(slot({ affixes: [] }), 50)).toBeNull();
  });
});
