import { describe, it, expect } from 'vitest';
import { normalizeAffix } from './normalize';

describe('normalizeAffix', () => {
  it('bỏ placeholder #, % và (local)', () => {
    const r = normalizeAffix('#% increased Evasion Rating (local)');
    expect(r.key).toBe('increased evasion rating');
    expect(r.label).toBe('increased Evasion Rating');
  });

  it('bỏ khoảng giá trị (70-100)', () => {
    const r = normalizeAffix('(70-100)% increased Evasion Rating (local)');
    expect(r.key).toBe('increased evasion rating');
  });

  it('gộp added physical damage', () => {
    expect(normalizeAffix('Adds # to # Physical Damage (local)').key).toBe('added physical damage');
    expect(normalizeAffix('Adds # to # Physical Damage to Attacks').key).toBe('added physical damage');
  });

  it('đổi mã snake_case sang chữ', () => {
    expect(normalizeAffix('damage_+%_with_bow_skills').key).toBe('damage with bow skills');
    expect(normalizeAffix('base_projectile_speed_+%').key).toBe('base projectile speed');
    expect(normalizeAffix('local_charm_slots').key).toBe('local charm slots');
  });

  it('gộp min/max added cold damage', () => {
    expect(normalizeAffix('attack_minimum_added_cold_damage').key).toBe('added cold damage');
    expect(normalizeAffix('attack_maximum_added_cold_damage').key).toBe('added cold damage');
  });

  it('giữ to maximum life', () => {
    expect(normalizeAffix('# to maximum Life').key).toBe('to maximum life');
  });
});
