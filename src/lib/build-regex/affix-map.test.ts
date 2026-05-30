import { describe, it, expect } from 'vitest';
import { lookup, resolveToken } from './affix-map';

describe('affix-map', () => {
  it('tra trúng affix phổ biến (confidence cao)', () => {
    expect(lookup('to maximum life')).toEqual({ token: 'imum L', confidence: 'high' });
    expect(lookup('increased evasion rating')).toEqual({ token: 'Eva', confidence: 'high' });
    expect(lookup('added cold damage')).toEqual({ token: 'Cold', confidence: 'high' });
  });

  it('map mã nội bộ sang token chuẩn', () => {
    expect(lookup('attack critical strike chance')?.token).toBe('Hit Cha');
    expect(lookup('attack speed')?.token).toBe('ck Spee');
  });

  it('trả null khi không có trong bảng', () => {
    expect(lookup('some weird unmapped affix')).toBeNull();
  });

  it('resolveToken dùng fallback + confidence low cho affix lạ', () => {
    const r = resolveToken('some weird unmapped affix', 'some weird unmapped affix');
    expect(r.confidence).toBe('low');
    expect(r.token.length).toBeGreaterThan(0);
  });

  it('resolveToken ưu tiên bảng khi có', () => {
    expect(resolveToken('to maximum life', 'to maximum Life')).toEqual({ token: 'imum L', confidence: 'high' });
  });
});
