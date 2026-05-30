import { describe, it, expect } from 'vitest';
import { wrapSearch } from './wrap';

describe('wrapSearch', () => {
  it('bọc ngoặc kép khi có dấu cách', () => {
    expect(wrapSearch('imum L|Eva')).toBe('"imum L|Eva"');
  });
  it('để trần khi không có dấu cách', () => {
    expect(wrapSearch('Eva|Physic')).toBe('Eva|Physic');
  });
});
