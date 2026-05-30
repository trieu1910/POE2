import type { AffixToken } from './types';

/**
 * Bảng quy đổi khóa-chuẩn (xem normalize.ts) → token regex ngắn, đặc trưng.
 * Token được chọn để là chuỗi con phân biệt trong text mod thật của POE2.
 * Tìm kiếm trong game không phân biệt hoa thường nên token chỉ cần khớp ký tự.
 */
const MAP: Record<string, AffixToken> = {
  // --- Phòng thủ / máu ---
  'to maximum life': { token: 'imum L', confidence: 'high' },
  'to maximum mana': { token: 'imum M', confidence: 'high' },
  'to maximum energy shield': { token: 'mum Ene', confidence: 'high' },
  'increased maximum energy shield': { token: 'mum Ene', confidence: 'high' },
  'increased energy shield': { token: 'sed Ene', confidence: 'high' },
  'increased evasion rating': { token: 'Eva', confidence: 'high' },
  'to evasion rating': { token: 'Eva', confidence: 'high' },
  'increased evasion and energy shield': { token: 'and Ene', confidence: 'high' },

  // --- Kháng / tiện ích ---
  'to lightning resistance': { token: 'Lightn', confidence: 'high' },
  'to fire resistance': { token: 'Fire R', confidence: 'high' },
  'to cold resistance': { token: 'Cold R', confidence: 'high' },
  'to chaos resistance': { token: 'Chaos R', confidence: 'high' },
  'to all elemental resistances': { token: 'al Res', confidence: 'high' },
  'increased rarity of items found': { token: 'Rarit', confidence: 'high' },
  'increased movement speed': { token: 'vement', confidence: 'high' },
  'to spirit': { token: 'Spiri', confidence: 'high' },
  'to accuracy rating': { token: 'ccura', confidence: 'high' },
  'gain tailwind on critical hit': { token: 'ailwin', confidence: 'high' },
  'to level of all projectile skills': { token: 'Projec', confidence: 'high' },
  'local charm slots': { token: 'rm Slot', confidence: 'high' },

  // --- Sát thương ---
  'added physical damage': { token: 'Physic', confidence: 'high' },
  'added cold damage': { token: 'Cold', confidence: 'high' },
  'added fire damage': { token: 'Fire', confidence: 'high' },
  'added lightning damage': { token: 'Lightn', confidence: 'high' },
  'no physical damage': { token: 'No Phys', confidence: 'high' },
  'increased damage with bow skills': { token: 'Bow', confidence: 'high' },
  'damage with bow skills': { token: 'Bow', confidence: 'high' },
  'bow attacks fire additional arrows': { token: 'Arrow', confidence: 'high' },
  'base projectile speed': { token: 'ile Spe', confidence: 'high' },

  // --- Crit / tốc độ ---
  'increased critical hit chance': { token: 'Hit Cha', confidence: 'high' },
  'increased critical hit chance for attacks': { token: 'Hit Cha', confidence: 'high' },
  'to critical hit chance': { token: 'Hit Cha', confidence: 'high' },
  'attack critical strike chance': { token: 'Hit Cha', confidence: 'high' },
  'to critical damage bonus': { token: 'Bonus', confidence: 'high' },
  'attack critical strike multiplier': { token: 'Bonus', confidence: 'high' },
  'attack speed': { token: 'ck Spee', confidence: 'high' },
  'increased attack speed': { token: 'ck Spee', confidence: 'high' },

  // --- Leech ---
  'leech of physical attack damage as life': { token: 'as Lif', confidence: 'high' },
  'leech of physical attack damage as mana': { token: 'as Man', confidence: 'high' },

  // --- Flask / charm ---
  'increased amount recovered': { token: 'ecover', confidence: 'high' },
  'increased charges per use': { token: 'es per', confidence: 'high' },
  'increased charges': { token: 'Charg', confidence: 'high' },
  'increased duration': { token: 'uration', confidence: 'high' },
};

const STOP = new Set([
  'to', 'increased', 'reduced', 'of', 'the', 'with', 'per', 'and', 'adds',
  'more', 'additional', 'attack', 'attacks', 'all', 'a', 'damage', 'rating',
  'chance', 'gain', 'your', 'base', 'local',
]);

export function lookup(key: string): AffixToken | null {
  return MAP[key] ?? null;
}

/** Tạo token tự động cho affix không có trong bảng (đánh dấu low). */
export function fallbackToken(label: string): AffixToken {
  const words = label
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
  const pick = [...words].sort((a, b) => b.length - a.length)[0] ?? label.trim().split(/\s+/)[0] ?? '';
  return { token: pick.slice(0, 6), confidence: 'low' };
}

/** Tra bảng trước, trượt thì fallback. */
export function resolveToken(key: string, label: string): AffixToken {
  return lookup(key) ?? fallbackToken(label);
}
