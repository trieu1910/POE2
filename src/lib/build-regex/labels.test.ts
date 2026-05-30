import { describe, it, expect } from 'vitest';
import { slotLabel } from './labels';

describe('slotLabel', () => {
  it('đổi inventory_id sang nhãn tiếng Việt', () => {
    expect(slotLabel('Helm1')).toBe('Mũ');
    expect(slotLabel('BodyArmour1')).toBe('Giáp thân');
    expect(slotLabel('Weapon1')).toBe('Vũ khí');
  });
  it('trả nguyên id nếu chưa có nhãn', () => {
    expect(slotLabel('Unknown9')).toBe('Unknown9');
  });
});
