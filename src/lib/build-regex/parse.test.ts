import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseBuild, BuildParseError } from './parse';

const fixture = readFileSync(
  fileURLToPath(new URL('./__fixtures__/ice-shot.build', import.meta.url)),
  'utf8',
);

describe('parseBuild', () => {
  it('đọc được tên build và danh sách ô đồ', () => {
    const b = parseBuild(fixture);
    expect(b.name).toContain('Ice Shot');
    expect(b.slots.length).toBeGreaterThan(10);
  });

  it('bóc base, baseClass và affix theo thứ tự', () => {
    const b = parseBuild(fixture);
    const helm = b.slots.find((s) => s.uniqueName === 'The Black Insignia');
    expect(helm).toBeDefined();
    expect(helm!.base).toBe('Corsair Cap');
    expect(helm!.baseClass).toBe('Dex Base');
    expect(helm!.affixes[0].label.toLowerCase()).toContain('evasion');
  });

  it('nhận diện đồ thường (không unique) và affix', () => {
    const b = parseBuild(fixture);
    const belt = b.slots.find((s) => s.inventoryId === 'Belt1' && s.levelInterval[1] === 64);
    expect(belt).toBeDefined();
    expect(belt!.uniqueName).toBeUndefined();
    expect(belt!.affixes.map((a) => a.key)).toContain('to maximum life');
  });

  it('ô không có Stat Priority → affixes rỗng', () => {
    const b = parseBuild(fixture);
    const w2 = b.slots.find((s) => s.inventoryId === 'Weapon2');
    expect(w2).toBeDefined();
    expect(w2!.affixes).toHaveLength(0);
  });

  it('JSON hỏng → BuildParseError', () => {
    expect(() => parseBuild('{ not json')).toThrow(BuildParseError);
  });

  it('thiếu inventory_slots → BuildParseError', () => {
    expect(() => parseBuild('{"name":"x"}')).toThrow(BuildParseError);
  });
});
