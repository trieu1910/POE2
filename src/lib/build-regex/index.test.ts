import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generate } from './index';

const fixture = readFileSync(
  fileURLToPath(new URL('./__fixtures__/ice-shot.build', import.meta.url)),
  'utf8',
);

describe('generate', () => {
  it('không lọc level → trả mọi ô', () => {
    const all = generate(fixture);
    expect(all.length).toBeGreaterThan(10);
  });

  it('lọc theo level endgame (90) chỉ giữ ô phù hợp', () => {
    const eg = generate(fixture, { level: 90 });
    expect(eg.every((r) => 90 >= r.slot.levelInterval[0] && 90 <= r.slot.levelInterval[1])).toBe(true);
    expect(eg.some((r) => r.slot.levelInterval[1] === 64)).toBe(false);
  });

  it('mỗi kết quả có ingameRegex (hoặc null) và trade', () => {
    const eg = generate(fixture, { level: 90, charLimit: 50 });
    const helm = eg.find((r) => r.slot.uniqueName === 'The Black Insignia');
    expect(helm).toBeDefined();
    expect(helm!.ingameRegex).toBeNull();
    const rare = eg.find((r) => r.slot.inventoryId === 'BodyArmour1');
    expect(rare!.ingameRegex).not.toBeNull();
    expect(rare!.ingameRegex!.length).toBeLessThanOrEqual(50);
    expect(rare!.trade.mustHave.length).toBeGreaterThan(0);
  });
});
