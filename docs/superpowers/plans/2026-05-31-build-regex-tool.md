# Build → Regex Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một trang trong website Astro cho phép import file `.build` (POE2 Build Planner) và xuất ra regex mua đồ theo từng ô + checklist stat cho trang trade.

**Architecture:** Logic thuần TypeScript ở `src/lib/build-regex/` (test bằng vitest), nhúng vào UI qua 1 component Astro client-side (`BuildRegexTool.astro`) đặt trong trang MDX của Starlight. Chạy 100% trong trình duyệt, không server.

**Tech Stack:** Astro 6 + Starlight, TypeScript (strict), vitest. Đang ở nhánh `feat/build-regex-tool`.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `src/lib/build-regex/types.ts` | Định nghĩa kiểu dữ liệu chung |
| `src/lib/build-regex/normalize.ts` | Làm sạch 1 dòng affix → khóa chuẩn + nhãn |
| `src/lib/build-regex/affix-map.ts` | Bảng quy đổi khóa→token (curate) + fallback |
| `src/lib/build-regex/parse.ts` | Bóc JSON `.build` → mô hình chuẩn |
| `src/lib/build-regex/regex.ts` | Ráp regex 1 ô theo giới hạn ký tự |
| `src/lib/build-regex/trade.ts` | Checklist stat cho trang trade |
| `src/lib/build-regex/labels.ts` | inventory_id → nhãn ô đồ tiếng Việt |
| `src/lib/build-regex/index.ts` | Nối: text file → kết quả từng ô |
| `src/lib/build-regex/__fixtures__/ice-shot.build` | File build thật làm fixture test |
| `src/components/BuildRegexTool.astro` | UI client-side |
| `src/content/docs/cong-cu-build/regex-mua-do.mdx` | Trang nhúng công cụ |
| `astro.config.mjs` | Thêm mục sidebar |
| `vitest.config.ts` | Cấu hình test |
| `tsconfig.json` | Thêm alias `@lib/*` |
| `package.json` | Thêm vitest + script `test` |

---

## Task 1: Cài đặt vitest + alias + types

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Modify: `tsconfig.json`
- Create: `src/lib/build-regex/types.ts`

- [ ] **Step 1: Cài vitest**

Run:
```bash
npm install -D vitest
```
Expected: vitest được thêm vào `devDependencies`.

- [ ] **Step 2: Thêm script test vào package.json**

Trong `package.json`, thêm vào object `"scripts"`:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: Tạo vitest.config.ts**

Create `vitest.config.ts`:
```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Thêm alias @lib vào tsconfig.json**

Trong `tsconfig.json`, sửa `compilerOptions.paths` thành:
```json
    "paths": {
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"]
    }
```

- [ ] **Step 5: Tạo types.ts**

Create `src/lib/build-regex/types.ts`:
```ts
export interface NormalizedAffix {
  /** Dòng affix gốc (đã bỏ markup, bỏ số thứ tự). */
  raw: string;
  /** Khóa chuẩn để tra bảng — luôn lowercase, không %, không +. */
  key: string;
  /** Nhãn hiển thị cho người đọc. */
  label: string;
}

export interface ParsedSlot {
  inventoryId: string;
  base: string;
  baseClass?: string;
  uniqueName?: string;
  levelInterval: [number, number];
  affixes: NormalizedAffix[];
}

export interface ParsedBuild {
  name: string;
  ascendancy?: string;
  slots: ParsedSlot[];
}

export type Confidence = 'high' | 'low';

export interface AffixToken {
  token: string;
  confidence: Confidence;
}

export interface IngameRegex {
  regex: string;
  length: number;
  included: string[];
  dropped: string[];
  warnings: string[];
}

export interface SlotResult {
  slot: ParsedSlot;
  ingameRegex: IngameRegex | null;
  trade: { mustHave: string[]; niceToHave: string[] };
}
```

- [ ] **Step 6: Chạy vitest để xác nhận khung chạy được**

Run:
```bash
npm test
```
Expected: "No test files found" (PASS, chưa có test) — xác nhận vitest cấu hình đúng.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tsconfig.json src/lib/build-regex/types.ts
git commit -m "chore: thêm vitest + alias @lib + types cho build-regex"
```

---

## Task 2: normalize.ts — làm sạch affix

**Files:**
- Create: `src/lib/build-regex/normalize.ts`
- Test: `src/lib/build-regex/normalize.test.ts`

- [ ] **Step 1: Viết test thất bại**

Create `src/lib/build-regex/normalize.test.ts`:
```ts
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
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run:
```bash
npx vitest run src/lib/build-regex/normalize.test.ts
```
Expected: FAIL — "Failed to resolve import './normalize'".

- [ ] **Step 3: Viết normalize.ts**

Create `src/lib/build-regex/normalize.ts`:
```ts
import type { NormalizedAffix } from './types';

const SNAKE = /^[a-z0-9]+(_[a-z0-9+%]+)+$/i;

/** Làm sạch markup/placeholder, trả về chuỗi người-đọc. */
function clean(input: string): string {
  let t = input.trim();
  if (SNAKE.test(t)) {
    t = t
      .replace(/_/g, ' ')
      .replace(/\s*\+\s*%/g, ' %')
      .replace(/\s*\+/g, '');
  }
  t = t.replace(/\((?:local)\)/gi, '');           // (local)
  t = t.replace(/\(\d+(?:\.\d+)?-\d+(?:\.\d+)?\)/g, ''); // (70-100)
  t = t.replace(/#/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

/** Đưa về khóa chuẩn: lowercase, bỏ % và +, gộp các biến thể added-damage. */
function canonicalize(cleaned: string): string {
  const k = cleaned
    .toLowerCase()
    .replace(/%/g, '')
    .replace(/\+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const m =
    k.match(/adds?\s+to\s+(physical|cold|fire|lightning|chaos)\s+damage/) ??
    k.match(/(?:minimum|maximum)\s+added\s+(physical|cold|fire|lightning|chaos)\s+damage/) ??
    k.match(/added\s+(physical|cold|fire|lightning|chaos)\s+damage/);
  if (m) return `added ${m[1]} damage`;

  return k;
}

export function normalizeAffix(raw: string): NormalizedAffix {
  const cleaned = clean(raw);
  return { raw, key: canonicalize(cleaned), label: cleaned };
}
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run:
```bash
npx vitest run src/lib/build-regex/normalize.test.ts
```
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/build-regex/normalize.ts src/lib/build-regex/normalize.test.ts
git commit -m "feat: normalize affix cho build-regex"
```

---

## Task 3: affix-map.ts — bảng quy đổi + fallback

**Files:**
- Create: `src/lib/build-regex/affix-map.ts`
- Test: `src/lib/build-regex/affix-map.test.ts`

- [ ] **Step 1: Viết test thất bại**

Create `src/lib/build-regex/affix-map.test.ts`:
```ts
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
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run:
```bash
npx vitest run src/lib/build-regex/affix-map.test.ts
```
Expected: FAIL — không resolve được import.

- [ ] **Step 3: Viết affix-map.ts**

Create `src/lib/build-regex/affix-map.ts`:
```ts
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
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run:
```bash
npx vitest run src/lib/build-regex/affix-map.test.ts
```
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/build-regex/affix-map.ts src/lib/build-regex/affix-map.test.ts
git commit -m "feat: bảng quy đổi affix→token + fallback"
```

---

## Task 4: parse.ts — bóc file .build

**Files:**
- Create: `src/lib/build-regex/parse.ts`
- Create: `src/lib/build-regex/__fixtures__/ice-shot.build` (copy từ file thật)
- Test: `src/lib/build-regex/parse.test.ts`

- [ ] **Step 1: Copy file build thật làm fixture**

Run (PowerShell):
```powershell
New-Item -ItemType Directory -Force "src/lib/build-regex/__fixtures__" | Out-Null
Copy-Item "$env:USERPROFILE/Documents/My Games/Path of Exile 2/BuildPlanner/aer0's Ice Shot Amazon - Variant 1.build" "src/lib/build-regex/__fixtures__/ice-shot.build"
```
Expected: file `src/lib/build-regex/__fixtures__/ice-shot.build` tồn tại.

- [ ] **Step 2: Viết test thất bại**

Create `src/lib/build-regex/parse.test.ts`:
```ts
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
```

- [ ] **Step 3: Chạy test để xác nhận FAIL**

Run:
```bash
npx vitest run src/lib/build-regex/parse.test.ts
```
Expected: FAIL — không resolve được import `./parse`.

- [ ] **Step 4: Viết parse.ts**

Create `src/lib/build-regex/parse.ts`:
```ts
import type { ParsedBuild, ParsedSlot, NormalizedAffix } from './types';
import { normalizeAffix } from './normalize';

export class BuildParseError extends Error {}

/** Bỏ markup POE dạng <tag>{...}. */
function stripMarkup(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/[{}]/g, '');
}

function parseSlot(raw: unknown): ParsedSlot {
  const r = (raw ?? {}) as Record<string, unknown>;
  const text = stripMarkup(String(r.additional_text ?? ''));
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const baseLine = lines[0] ?? '';
  const classMatch = baseLine.match(/\(([^)]*Base)\)/);
  const baseClass = classMatch?.[1];
  const base = baseLine.replace(/\s*\([^)]*Base\)\s*/, '').trim();

  const affixes: NormalizedAffix[] = lines
    .map((l) => l.match(/^\d+\.\s*(.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => normalizeAffix(m[1]));

  const li = r.level_interval;
  const levelInterval: [number, number] =
    Array.isArray(li) && li.length === 2 ? [Number(li[0]), Number(li[1])] : [1, 100];

  return {
    inventoryId: String(r.inventory_id ?? ''),
    base,
    baseClass,
    uniqueName: r.unique_name ? String(r.unique_name) : undefined,
    levelInterval,
    affixes,
  };
}

export function parseBuild(jsonText: string): ParsedBuild {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    throw new BuildParseError('File không đọc được — đảm bảo đây là file .build hợp lệ.');
  }
  const rawSlots = data.inventory_slots;
  if (!Array.isArray(rawSlots)) {
    throw new BuildParseError('File này không có phần đồ (inventory).');
  }
  return {
    name: String(data.name ?? ''),
    ascendancy: data.ascendancy ? String(data.ascendancy) : undefined,
    slots: rawSlots.map(parseSlot),
  };
}
```

- [ ] **Step 5: Chạy test để xác nhận PASS**

Run:
```bash
npx vitest run src/lib/build-regex/parse.test.ts
```
Expected: PASS (6 tests). Nếu một assertion về base/affix lệch, đọc lại fixture để chỉnh assertion cho khớp dữ liệu thật (logic parse vẫn giữ).

- [ ] **Step 6: Commit**

```bash
git add src/lib/build-regex/parse.ts src/lib/build-regex/parse.test.ts src/lib/build-regex/__fixtures__/ice-shot.build
git commit -m "feat: parse file .build → mô hình chuẩn"
```

---

## Task 5: regex.ts — ráp regex theo giới hạn ký tự

**Files:**
- Create: `src/lib/build-regex/regex.ts`
- Test: `src/lib/build-regex/regex.test.ts`

- [ ] **Step 1: Viết test thất bại**

Create `src/lib/build-regex/regex.test.ts`:
```ts
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
      8, // chỉ đủ cho "imum L"
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
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run:
```bash
npx vitest run src/lib/build-regex/regex.test.ts
```
Expected: FAIL — không resolve được import `./regex`.

- [ ] **Step 3: Viết regex.ts**

Create `src/lib/build-regex/regex.ts`:
```ts
import type { ParsedSlot, IngameRegex } from './types';
import { resolveToken } from './affix-map';

const META = /[.^$*+?()[\]{}|\\]/g;

/** Escape ký tự đặc biệt regex, giữ nguyên khoảng trắng. */
function escapeToken(t: string): string {
  return t.replace(META, '\\$&');
}

export function buildIngameRegex(slot: ParsedSlot, charLimit = 50): IngameRegex | null {
  if (slot.uniqueName) return null;
  if (slot.affixes.length === 0) return null;

  const tokens: string[] = [];
  const included: string[] = [];
  const dropped: string[] = [];
  const warnings: string[] = [];

  for (const a of slot.affixes) {
    const resolved = resolveToken(a.key, a.label);
    const piece = escapeToken(resolved.token);
    const candidate = [...tokens, piece].join('|');

    if (candidate.length > charLimit && tokens.length > 0) {
      // Không nhét được — bỏ qua, vẫn thử các token ngắn hơn phía sau.
      dropped.push(a.label);
      continue;
    }

    tokens.push(piece);
    included.push(a.label);
    if (resolved.confidence === 'low') warnings.push(a.label);
  }

  const regex = tokens.join('|');
  return { regex, length: regex.length, included, dropped, warnings };
}
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run:
```bash
npx vitest run src/lib/build-regex/regex.test.ts
```
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/build-regex/regex.ts src/lib/build-regex/regex.test.ts
git commit -m "feat: ráp regex trong-game theo giới hạn ký tự"
```

---

## Task 6: trade.ts — checklist cho trang trade

**Files:**
- Create: `src/lib/build-regex/trade.ts`
- Test: `src/lib/build-regex/trade.test.ts`

- [ ] **Step 1: Viết test thất bại**

Create `src/lib/build-regex/trade.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildTradeList } from './trade';
import type { ParsedSlot, NormalizedAffix } from './types';

function affix(label: string): NormalizedAffix {
  return { raw: label, key: label.toLowerCase(), label };
}

const slot = (labels: string[]): ParsedSlot => ({
  inventoryId: 'X',
  base: 'Base',
  levelInterval: [1, 100],
  affixes: labels.map(affix),
});

describe('buildTradeList', () => {
  it('3 dòng đầu là bắt buộc, còn lại nên có', () => {
    const r = buildTradeList(slot(['A', 'B', 'C', 'D', 'E']));
    expect(r.mustHave).toEqual(['A', 'B', 'C']);
    expect(r.niceToHave).toEqual(['D', 'E']);
  });

  it('gộp nhãn trùng (vd min/max added damage)', () => {
    const r = buildTradeList(slot(['Adds to Physical Damage', 'Adds to Physical Damage', 'to maximum Life']));
    expect([...r.mustHave, ...r.niceToHave]).toEqual(['Adds to Physical Damage', 'to maximum Life']);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run:
```bash
npx vitest run src/lib/build-regex/trade.test.ts
```
Expected: FAIL — không resolve được import `./trade`.

- [ ] **Step 3: Viết trade.ts**

Create `src/lib/build-regex/trade.ts`:
```ts
import type { ParsedSlot } from './types';

export function buildTradeList(slot: ParsedSlot): { mustHave: string[]; niceToHave: string[] } {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const a of slot.affixes) {
    const k = a.label.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(a.label);
  }
  return { mustHave: unique.slice(0, 3), niceToHave: unique.slice(3) };
}
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run:
```bash
npx vitest run src/lib/build-regex/trade.test.ts
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/build-regex/trade.ts src/lib/build-regex/trade.test.ts
git commit -m "feat: checklist stat cho trang trade"
```

---

## Task 7: labels.ts — nhãn ô đồ tiếng Việt

**Files:**
- Create: `src/lib/build-regex/labels.ts`
- Test: `src/lib/build-regex/labels.test.ts`

- [ ] **Step 1: Viết test thất bại**

Create `src/lib/build-regex/labels.test.ts`:
```ts
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
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run:
```bash
npx vitest run src/lib/build-regex/labels.test.ts
```
Expected: FAIL — không resolve được import `./labels`.

- [ ] **Step 3: Viết labels.ts**

Create `src/lib/build-regex/labels.ts`:
```ts
const LABELS: Record<string, string> = {
  Belt1: 'Thắt lưng',
  Amulet1: 'Dây chuyền',
  BodyArmour1: 'Giáp thân',
  Gloves1: 'Găng tay',
  Helm1: 'Mũ',
  Offhand1: 'Bao tên/Khiên',
  Offhand2: 'Bao tên/Khiên (phụ)',
  Trinket1: 'Charm',
  Flask1: 'Bình',
  Ring1: 'Nhẫn 1',
  Ring2: 'Nhẫn 2',
  Boots1: 'Giày',
  Weapon1: 'Vũ khí',
  Weapon2: 'Vũ khí (phụ)',
};

export function slotLabel(id: string): string {
  return LABELS[id] ?? id;
}
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run:
```bash
npx vitest run src/lib/build-regex/labels.test.ts
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/build-regex/labels.ts src/lib/build-regex/labels.test.ts
git commit -m "feat: nhãn ô đồ tiếng Việt"
```

---

## Task 8: index.ts — nối toàn bộ

**Files:**
- Create: `src/lib/build-regex/index.ts`
- Test: `src/lib/build-regex/index.test.ts`

- [ ] **Step 1: Viết test thất bại**

Create `src/lib/build-regex/index.test.ts`:
```ts
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
    // ô leveling-only [1,64] không được lọt vào
    expect(eg.some((r) => r.slot.levelInterval[1] === 64)).toBe(false);
  });

  it('mỗi kết quả có ingameRegex (hoặc null) và trade', () => {
    const eg = generate(fixture, { level: 90, charLimit: 50 });
    const helm = eg.find((r) => r.slot.uniqueName === 'The Black Insignia');
    expect(helm).toBeDefined();
    expect(helm!.ingameRegex).toBeNull(); // unique → null
    const rare = eg.find((r) => r.slot.inventoryId === 'BodyArmour1');
    expect(rare!.ingameRegex).not.toBeNull();
    expect(rare!.ingameRegex!.length).toBeLessThanOrEqual(50);
    expect(rare!.trade.mustHave.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run:
```bash
npx vitest run src/lib/build-regex/index.test.ts
```
Expected: FAIL — không resolve được import `./index`.

- [ ] **Step 3: Viết index.ts**

Create `src/lib/build-regex/index.ts`:
```ts
import type { SlotResult } from './types';
import { parseBuild } from './parse';
import { buildIngameRegex } from './regex';
import { buildTradeList } from './trade';

export interface GenerateOptions {
  /** Lọc ô đồ theo level. Bỏ trống = lấy tất cả. */
  level?: number;
  /** Giới hạn ký tự cho ô search trong game. */
  charLimit?: number;
}

export function generate(jsonText: string, opts: GenerateOptions = {}): SlotResult[] {
  const build = parseBuild(jsonText);
  const slots =
    opts.level == null
      ? build.slots
      : build.slots.filter(
          (s) => opts.level! >= s.levelInterval[0] && opts.level! <= s.levelInterval[1],
        );

  return slots.map((slot) => ({
    slot,
    ingameRegex: buildIngameRegex(slot, opts.charLimit ?? 50),
    trade: buildTradeList(slot),
  }));
}

export { parseBuild, BuildParseError } from './parse';
export type { SlotResult, ParsedSlot } from './types';
```

- [ ] **Step 4: Chạy toàn bộ test để xác nhận PASS**

Run:
```bash
npm test
```
Expected: PASS toàn bộ (tất cả file test trong build-regex).

- [ ] **Step 5: Commit**

```bash
git add src/lib/build-regex/index.ts src/lib/build-regex/index.test.ts
git commit -m "feat: index nối parse→regex→trade"
```

---

## Task 9: BuildRegexTool.astro — UI client-side

**Files:**
- Create: `src/components/BuildRegexTool.astro`

- [ ] **Step 1: Viết component**

Create `src/components/BuildRegexTool.astro`:
```astro
---
// Công cụ client-side: không có props, mọi xử lý chạy trong trình duyệt.
---
<div class="brt">
  <div class="brt-controls">
    <label class="brt-drop" id="brt-drop">
      📂 Kéo-thả file <code>.build</code> vào đây, hoặc bấm để chọn file
      <input type="file" id="brt-file" accept=".build,.json,application/json" hidden />
    </label>
    <details class="brt-paste">
      <summary>…hoặc dán nội dung file</summary>
      <textarea id="brt-text" rows="6" placeholder="Dán toàn bộ nội dung file .build vào đây"></textarea>
      <button id="brt-parse" type="button">Phân tích</button>
    </details>
    <div class="brt-opts">
      <span>Giai đoạn:</span>
      <button type="button" data-level="60" class="brt-stage">Leveling (1-64)</button>
      <button type="button" data-level="90" class="brt-stage is-active">Endgame (65+)</button>
      <button type="button" data-level="" class="brt-stage">Tất cả</button>
      <label>Giới hạn ký tự: <input type="number" id="brt-limit" value="50" min="10" max="250" /></label>
    </div>
  </div>
  <p class="brt-msg" id="brt-msg">Chưa có file. Hãy nạp một file <code>.build</code> để bắt đầu.</p>
  <div class="brt-output" id="brt-output"></div>
</div>

<script>
  import { generate, BuildParseError } from '../lib/build-regex/index';
  import { slotLabel } from '../lib/build-regex/labels';

  const fileInput = document.getElementById('brt-file') as HTMLInputElement;
  const drop = document.getElementById('brt-drop') as HTMLLabelElement;
  const textArea = document.getElementById('brt-text') as HTMLTextAreaElement;
  const parseBtn = document.getElementById('brt-parse') as HTMLButtonElement;
  const limitInput = document.getElementById('brt-limit') as HTMLInputElement;
  const msg = document.getElementById('brt-msg') as HTMLParagraphElement;
  const output = document.getElementById('brt-output') as HTMLDivElement;
  const stageBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.brt-stage'));

  let rawText = '';
  let level: number | undefined = 90;

  function esc(s: string): string {
    return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  }

  function render() {
    if (!rawText) return;
    let results;
    try {
      results = generate(rawText, { level, charLimit: Number(limitInput.value) || 50 });
    } catch (e) {
      output.innerHTML = '';
      msg.textContent = e instanceof BuildParseError ? e.message : 'Có lỗi khi xử lý file.';
      return;
    }
    if (results.length === 0) {
      msg.textContent = 'Không có ô đồ nào khớp giai đoạn đã chọn.';
      output.innerHTML = '';
      return;
    }
    msg.textContent = `Đã tạo cho ${results.length} ô đồ.`;
    output.innerHTML = results.map(cardHtml).join('');
    output.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copy ?? '');
        btn.textContent = '✓ Đã copy';
        setTimeout(() => (btn.textContent = 'Copy'), 1200);
      });
    });
  }

  function cardHtml(r: ReturnType<typeof generate>[number]): string {
    const head = `${esc(slotLabel(r.slot.inventoryId))} — ${esc(r.slot.base)}${
      r.slot.baseClass ? ` <small>(${esc(r.slot.baseClass)})</small>` : ''
    }`;

    let body: string;
    if (r.slot.uniqueName) {
      body = `<p>🔶 Đồ unique → search theo tên: <code>${esc(r.slot.uniqueName)}</code>
        <button data-copy="${esc(r.slot.uniqueName)}">Copy</button></p>`;
    } else if (r.ingameRegex) {
      const g = r.ingameRegex;
      body = `
        <p><b>Regex trong game</b> (${g.length} ký tự):</p>
        <div class="brt-regex"><code>${esc(g.regex)}</code>
          <button data-copy="${esc(g.regex)}">Copy</button></div>
        <p class="brt-meta">Gồm: ${g.included.map(esc).join(', ') || '—'}</p>
        ${g.dropped.length ? `<p class="brt-meta brt-warn">Đã bỏ (quá giới hạn): ${g.dropped.map(esc).join(', ')}</p>` : ''}
        ${g.warnings.length ? `<p class="brt-meta brt-warn">⚠ Chưa chắc: ${g.warnings.map(esc).join(', ')}</p>` : ''}`;
    } else {
      body = `<p>Không có affix để lọc — search theo base: <code>${esc(r.slot.base)}</code></p>`;
    }

    const trade = `
      <p class="brt-meta"><b>Trade — Bắt buộc:</b> ${r.trade.mustHave.map(esc).join('; ') || '—'}</p>
      ${r.trade.niceToHave.length ? `<p class="brt-meta"><b>Nên có:</b> ${r.trade.niceToHave.map(esc).join('; ')}</p>` : ''}`;

    return `<article class="brt-card"><h3>${head}</h3>${body}${trade}</article>`;
  }

  function loadText(t: string) {
    rawText = t;
    render();
  }

  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) f.text().then(loadText);
  });
  ['dragover', 'dragenter'].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }),
  );
  ['dragleave', 'drop'].forEach((ev) =>
    drop.addEventListener(ev, () => drop.classList.remove('is-over')),
  );
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    const f = (e as DragEvent).dataTransfer?.files?.[0];
    if (f) f.text().then(loadText);
  });
  parseBtn.addEventListener('click', () => loadText(textArea.value));
  limitInput.addEventListener('change', render);
  stageBtns.forEach((b) =>
    b.addEventListener('click', () => {
      stageBtns.forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      level = b.dataset.level ? Number(b.dataset.level) : undefined;
      render();
    }),
  );
</script>

<style>
  .brt { margin: 1.5rem 0; }
  .brt-drop { display: block; border: 2px dashed var(--sl-color-gray-4); border-radius: 0.5rem;
    padding: 1.25rem; text-align: center; cursor: pointer; background: var(--sl-color-gray-6); }
  .brt-drop.is-over { border-color: var(--sl-color-accent); }
  .brt-paste { margin: 0.75rem 0; }
  .brt-paste textarea { width: 100%; font-family: var(--sl-font-mono); }
  .brt-opts { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin: 0.75rem 0; }
  .brt-stage { padding: 0.25rem 0.6rem; border: 1px solid var(--sl-color-gray-4); border-radius: 0.4rem;
    background: transparent; cursor: pointer; }
  .brt-stage.is-active { background: var(--sl-color-accent); color: var(--sl-color-white); }
  .brt-limit, .brt-opts input[type='number'] { width: 4rem; }
  .brt-msg { color: var(--sl-color-gray-3); }
  .brt-card { border: 1px solid var(--sl-color-gray-5); border-left: 4px solid var(--sl-color-accent);
    border-radius: 0.5rem; padding: 0.75rem 1rem; margin: 0.75rem 0; background: var(--sl-color-gray-6); }
  .brt-card h3 { margin: 0 0 0.5rem; font-size: 1rem; }
  .brt-regex { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  .brt-regex code { font-size: 1.05rem; }
  .brt-meta { font-size: 0.85rem; margin: 0.35rem 0; }
  .brt-warn { color: var(--sl-color-orange-high, #c47f00); }
  .brt-card button, .brt-paste button { cursor: pointer; padding: 0.2rem 0.6rem;
    border: 1px solid var(--sl-color-gray-4); border-radius: 0.4rem; background: var(--sl-color-gray-5); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BuildRegexTool.astro
git commit -m "feat: component UI BuildRegexTool (client-side)"
```

---

## Task 10: Trang MDX + sidebar

**Files:**
- Create: `src/content/docs/cong-cu-build/regex-mua-do.mdx`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Tạo trang MDX**

Create `src/content/docs/cong-cu-build/regex-mua-do.mdx`:
```mdx
---
title: 🔎 Regex mua đồ từ file build
description: Import file .build của POE2 và xuất ra regex để lọc/mua đồ nhanh ở ô search trong game, kèm checklist cho trang trade.
lastUpdated: 2026-05-31
---

import BuildRegexTool from '@components/BuildRegexTool.astro';

:::tip[👉 Công cụ này làm gì]
- Bạn nạp file `.build` (export từ Build Planner trong game POE2).
- Công cụ đọc danh sách đồ theo build và **xuất regex cho từng ô** để dán vào **ô search trong game** (túi đồ / stash / cửa hàng) — món khớp sẽ sáng lên.
- Kèm **checklist stat** để bạn lọc trên trang trade.
:::

<BuildRegexTool />

## Cách dùng regex trong game

1. Mở túi đồ / stash / cửa hàng NPC, tìm **ô search** (kính lúp).
2. Dán chuỗi regex của ô đồ tương ứng vào ô đó.
3. Món nào khớp sẽ được tô sáng — đó là ứng viên đáng xem.

## Vài điều cần biết

- **Regex là bản rút gọn, không phải bản dịch 1-1.** Ô search trong game có **giới hạn ký tự** (mặc định ~50), nên công cụ chỉ nhồi được vài affix ưu tiên đầu mỗi ô. Phần bị cắt sẽ ghi rõ ở mục "Đã bỏ".
- **Token ⚠ "chưa chắc"** là affix chưa có trong bảng quy đổi — công cụ đoán token tự động, bạn nên tự kiểm lại.
- **Giai đoạn**: file build thường có 2 bộ đồ (leveling và endgame). Chọn đúng giai đoạn để ra đồ phù hợp.
- **Trang trade** (pathofexile.com) dùng bộ lọc có cấu trúc, không phải regex — nên ở đó hãy dùng **checklist stat** mà công cụ liệt kê.
```

- [ ] **Step 2: Cập nhật sidebar trong astro.config.mjs**

Trong `astro.config.mjs`, thay dòng:
```js
        { label: '🛠️ Công cụ Build', link: '/cong-cu-build/' },
```
bằng:
```js
        {
          label: '🛠️ Công cụ Build',
          items: [
            { label: 'Tổng quan', link: '/cong-cu-build/' },
            { label: 'Regex mua đồ từ build', link: '/cong-cu-build/regex-mua-do/' },
          ],
        },
```

- [ ] **Step 3: Build thử để xác nhận không lỗi**

Run:
```bash
npm run build
```
Expected: build thành công, không lỗi link-validator, có route `/cong-cu-build/regex-mua-do/`.

- [ ] **Step 4: Commit**

```bash
git add src/content/docs/cong-cu-build/regex-mua-do.mdx astro.config.mjs
git commit -m "feat: trang Regex mua đồ + mục sidebar"
```

---

## Task 11: Kiểm thử & hoàn tất

**Files:** (không sửa file — chỉ verify)

- [ ] **Step 1: Chạy toàn bộ unit test**

Run:
```bash
npm test
```
Expected: tất cả test PASS.

- [ ] **Step 2: Kiểm tra build production**

Run:
```bash
npm run build
```
Expected: thành công.

- [ ] **Step 3: Kiểm thử thủ công trong trình duyệt**

Run:
```bash
npm run dev
```
Mở `http://localhost:4321/POE2/cong-cu-build/regex-mua-do/`. Kiểm:
- Kéo-thả file `aer0's Ice Shot Amazon - Variant 1.build` → hiện các thẻ ô đồ.
- Mỗi ô có regex + số ký tự ≤ giới hạn; nút **Copy** chạy.
- Đổi giai đoạn Leveling/Endgame → danh sách ô đồ thay đổi.
- Đồ unique (The Black Insignia) hiện "search theo tên".

Expected: tất cả mục trên hoạt động đúng. (Nếu lỗi, dừng và sửa trước khi tiếp.)

- [ ] **Step 4: Dùng skill finishing-a-development-branch**

Sau khi mọi thứ xanh, dùng `superpowers:finishing-a-development-branch` để chốt nhánh `feat/build-regex-tool` (merge/PR/cleanup theo lựa chọn của người dùng).

---

## Self-Review (đã kiểm)

- **Spec coverage:** parse (Task 4), normalize (Task 2), affix-map A+fallback (Task 3), regex char-limit (Task 5), trade (Task 6), UI kéo-thả/dán + giai đoạn + giới hạn ký tự + copy (Task 9), trang + sidebar (Task 10), vitest + fixture build thật (Task 1/4/8), xử lý lỗi JSON/thiếu inventory/unique (Task 4/5/9). ✅
- **Placeholder scan:** không còn TODO/TBD; mọi step có code/lệnh cụ thể. ✅
- **Type consistency:** `ParsedSlot/IngameRegex/SlotResult` (types.ts) dùng nhất quán; `resolveToken`, `buildIngameRegex`, `buildTradeList`, `slotLabel`, `generate` khớp tên giữa các task. ✅
```
