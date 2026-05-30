# Thiết kế: Công cụ "Build → Regex mua đồ"

**Ngày:** 2026-05-31
**Trạng thái:** Đã duyệt thiết kế, chờ viết plan triển khai

## Vấn đề

Người chơi POE2 theo build của người khác (file `.build` export từ in-game Build Planner).
Một số build có sẵn "vendor regex" để mua/lọc đồ nhanh, một số thì không. Người dùng muốn:

> Import một file `.build` bất kỳ → tự động xuất ra regex để mua/tìm đồ nhanh ở ô search
> trong game, thay vì dò từng món bằng mắt.

Công cụ phải **tái dùng cho mọi build**, và sống trong website Astro/Starlight sẵn có
(`Master POE 2`, deploy tĩnh lên GitHub Pages).

## Phân tích file `.build`

File là JSON. Các khóa cấp cao: `name`, `author`, `description`, `ascendancy`,
`passives[]`, `skills[]`, `inventory_slots[]`.

Phần quyết định cho việc mua đồ là **`inventory_slots[]`**. Mỗi phần tử:

```json
{
  "inventory_id": "Helm1",
  "unique_name": "The Black Insignia",        // optional — chỉ có nếu là đồ unique
  "level_interval": [65, 100],
  "additional_text": "<rgb(...)>{<b>{<m>{Corsair Cap (Dex Base)}}}\r\n\r\n<b>{<m>{Stat Priority}}\r\n-------------------\r\n<s>{1. (70-100)% increased Evasion Rating (local)\r\n2. +(15-25)% to Lightning Resistance\r\n...}"
}
```

Quan sát quan trọng:
- `additional_text` dùng markup riêng của POE: `<tag>{...}`, `\r\n` xuống dòng,
  dòng đầu là **tên base** (đôi khi kèm `(Dex Base)` / `(Int Base)`), sau đó là khối
  `Stat Priority` đánh số `1. 2. 3.` — đây là **affix theo thứ tự ưu tiên**.
- Affix viết ở vài dạng:
  - Người-đọc với placeholder: `# to maximum Life`, `#% increased Evasion Rating`,
    `Adds # to # Physical Damage (local)`.
  - Có khoảng giá trị: `(70-100)% increased Evasion Rating (local)`.
  - Mã nội bộ snake_case: `attack_minimum_added_cold_damage`,
    `damage_+%_with_bow_skills`, `local_charm_slots`.
- Cùng một `inventory_id` có thể xuất hiện **nhiều lần** với `level_interval` khác nhau
  (bộ đồ leveling 1-64 vs endgame 65-100). Một số ô có `slot_x/slot_y` để phân biệt
  nhiều charm/flask.

## Ràng buộc cốt lõi (lý do regex phải "nén")

- Ô search trong game POE2 khớp **chuỗi con** trên text của item và hỗ trợ cú pháp
  regex (engine kiểu RE2: `|`, lớp ký tự, `"..."`, tiền tố `!` phủ định).
- Có **giới hạn ký tự** (lịch sử PoE1 ~50; POE2 chưa xác nhận chính xác → để cấu hình
  được, mặc định 50).
- Do đó regex **không** là bản dịch 1-1 của mọi affix. Nó là bản **rút gọn thông minh**:
  chọn vài affix ưu tiên đầu mỗi ô, quy mỗi affix về một **token ngắn, đặc trưng**,
  nối bằng `|` tới khi gần chạm giới hạn.
- Độ chính xác phụ thuộc **bảng quy đổi affix → token** (curate tay).

## Hướng đã chọn: A — Bảng quy đổi thủ công + fallback tự động

- Từ điển curate tay (~60-80 affix phổ biến: Life, Mana, ES, Evasion, các Resistance,
  Spirit, Movement Speed, attribute, added phys/cold/lightning damage, crit chance/multi,
  attack speed, accuracy, projectile, charm slots...) → token regex ngắn đã chọn để
  **đặc trưng** (tránh trùng mod khác).
- Affix không có trong bảng → **fallback tự động**: làm sạch placeholder + lấy từ khóa
  đặc trưng, và **đánh cờ ⚠ "chưa chắc"** để người dùng tự kiểm.
- Loại bỏ Hướng B (thuần tự động, token thô) và Hướng C (nhúng database mod POE2 đầy đủ —
  over-engineer cho v1).

## Kiến trúc

Site tĩnh → công cụ chạy 100% trong trình duyệt, không server. Hai lớp:

### Lớp logic thuần (TypeScript, không dính UI) — `src/lib/build-regex/`

| Module | Nhiệm vụ | Đầu vào → Đầu ra |
|---|---|---|
| `parse.ts` | Đọc JSON `.build`, bóc markup `additional_text` | text → `ParsedBuild` |
| `normalize.ts` | Làm sạch 1 dòng affix → khóa chuẩn + nhãn | `"#% increased Evasion Rating (local)"` → `{ key: "increased evasion rating", label: "x% Evasion Rating" }` |
| `affix-map.ts` | Bảng curate khóa chuẩn → token | `"increased evasion rating"` → `{ token: "Eva", confidence: "high" }` |
| `regex.ts` | Ráp regex 1 ô theo giới hạn ký tự | `Slot, charLimit` → `{ regex, length, included[], dropped[], hasWarnings }` |
| `trade.ts` | Danh sách stat dễ đọc cho trang trade | `Slot` → `{ mustHave[], niceToHave[] }` |
| `index.ts` | Nối chuỗi: text file → kết quả từng ô | text → `SlotResult[]` |

**Kiểu dữ liệu chính (phác thảo):**

```ts
interface ParsedSlot {
  inventoryId: string;        // "Helm1"
  displaySlot: string;        // "Mũ" (map sang nhãn VN)
  base: string;               // "Corsair Cap"
  baseClass?: string;         // "Dex Base"
  uniqueName?: string;        // "The Black Insignia"
  levelInterval: [number, number];
  affixes: NormalizedAffix[]; // theo thứ tự ưu tiên
}
interface NormalizedAffix { raw: string; key: string; label: string; }
interface SlotResult {
  slot: ParsedSlot;
  ingameRegex: { regex: string; length: number; included: string[]; dropped: string[]; warnings: string[]; };
  trade: { mustHave: string[]; niceToHave: string[]; };
}
```

### Lớp giao diện — `src/components/BuildRegexTool.astro`

- Có `<script>` client; import từ `src/lib/build-regex/`.
- Nhúng vào trang MDX `src/content/docs/cong-cu-build/regex-mua-do.mdx` (giống cách
  `Hop.astro` được import trong các `.mdx` khác).
- Cập nhật sidebar trong `astro.config.mjs`: biến mục `🛠️ Công cụ Build` (đang là 1 link
  đơn) thành nhóm gồm trang tổng quan cũ + "Regex mua đồ từ file build".

## Luồng dữ liệu

```
file .build (kéo-thả HOẶC dán)
  → parse()            -> ParsedBuild { slots[] }
  → lọc theo giai đoạn (Leveling 1-64 / Endgame 65+)
  → mỗi slot: normalize() từng affix
  → tra affix-map (trượt → fallback + ⚠)
  → regex() ráp theo charLimit
  → trade() ra checklist
  → render 1 thẻ / ô đồ
```

## Giao diện trang `/cong-cu-build/regex-mua-do/`

- Vùng **kéo-thả file** + ô **dán nội dung** (cho người ngại upload).
- **Nút chọn giai đoạn:** Leveling (1-64) / Endgame (65+) — vì file có 2 bộ đồ.
- Ô số **giới hạn ký tự** (mặc định 50).
- Mỗi ô đồ = 1 thẻ:
  - Tên ô (VN) + base + (nếu unique) tên unique.
  - **Regex trong-game**: chuỗi + số ký tự + nút **Copy**. Liệt kê affix đã gồm / đã bỏ.
    Token ⚠ được tô khác màu.
  - **Checklist trade**: "Bắt buộc" (2-3 dòng đầu) / "Nên có" (phần sau).
  - Đồ unique: chỉ hiện "Search theo tên: `<tên unique>`", không ráp regex affix.
- Khối giải thích tiếng Việt: regex là bản rút gọn; cách dán vào ô search trong game;
  lưu ý giới hạn ký tự; token ⚠ nghĩa là gì.

## Xử lý lỗi / ca biên

| Tình huống | Hành vi |
|---|---|
| JSON hỏng | Báo tiếng Việt: "File không đọc được — đảm bảo đây là file .build hợp lệ." |
| Thiếu `inventory_slots` | "File này không có phần đồ (inventory)." |
| Affix lạ (không trong map) | Token fallback + cờ ⚠ "chưa chắc". |
| Giới hạn ký tự quá nhỏ | Hiện phần vừa đủ + cảnh báo "đã cắt bớt affix". |
| Đồ unique | Bỏ qua regex affix, chỉ gợi ý search theo tên. |
| Chưa nạp file | Hiện hướng dẫn, không lỗi. |

## Kiểm thử

- Thêm **vitest** (dev-dependency mới) + script `test` trong `package.json`.
- Unit test:
  - `parse.test.ts` — dùng **chính file aer0 Ice Shot** làm fixture (copy vào
    `src/lib/build-regex/__fixtures__/`), kiểm số ô, base, affix bóc đúng.
  - `normalize.test.ts` — các dạng affix (placeholder, range, snake_case, min/max).
  - `affix-map.test.ts` — tra trúng vài affix phổ biến.
  - `regex.test.ts` — tôn trọng giới hạn ký tự; báo đúng included/dropped.
- Thủ công: chạy `npm run dev`, nạp file thật, xem render + nút Copy hoạt động.

## Phạm vi v1 (YAGNI)

**Có:** regex trong-game theo ô + checklist trade + chọn giai đoạn + chỉnh giới hạn ký tự
+ kéo-thả/dán + copy.

**Để sau:**
- Database mod POE2 đầy đủ (Hướng C) để token tối ưu tuyệt đối.
- Tự sinh link trang trade.
- Xử lý `passives` / `skills` (không liên quan việc "mua đồ").
- Lưu/chia sẻ kết quả.

## Rủi ro chính

- **Chất lượng bảng `affix-map`** quyết định độ hữu dụng. Giảm thiểu bằng: phủ affix phổ
  biến nhất trước, fallback an toàn + cờ ⚠, và test bằng build thật.
- **Giới hạn ký tự thật của POE2** chưa xác nhận → để cấu hình được, mặc định 50, ghi rõ
  trong phần giải thích.
