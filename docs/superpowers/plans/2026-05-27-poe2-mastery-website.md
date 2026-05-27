# Website "Master POE 2 A→Z" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng một website tiếng Việt (Astro + Starlight) dạy Path of Exile 2 cho tân thủ theo lộ trình A→Z 11 chương, online responsive, deploy miễn phí.

**Architecture:** Astro + Starlight (theme docs) sinh trang tĩnh từ Markdown/MDX tiếng Việt. Sidebar chia 4 khu (Lộ trình học làm trước; 3 khu công cụ để khung trống). Mỗi trang bài học theo khuôn thống nhất dùng một component dùng chung `Hop.astro` (3 biến thể: Thuật ngữ Anh–Việt / Nguồn gốc / Điểm mấu chốt) + Aside có sẵn của Starlight. Deploy bằng GitHub Actions lên GitHub Pages.

**Tech Stack:** Astro, @astrojs/starlight, starlight-links-validator, MDX, Node 24 / npm 11, git, GitHub Pages (Actions). Hệ máy: Windows 11, PowerShell.

**Lưu ý về "test":** Đây là site nội dung tĩnh, hầu như không có logic để unit-test. "Kiểm thử" ở đây nghĩa là: `astro build` chạy sạch, **starlight-links-validator** không báo link nội bộ hỏng, và dev server render đúng khi xem mắt. Các bước verify dưới đây phản ánh điều đó thay vì unit test giả tạo.

---

## PHẦN 1 — DỰNG KHUNG (Đợt 0)

### Task 1: Scaffold dự án Astro + Starlight

**Files:**
- Create: toàn bộ scaffold Starlight ở thư mục gốc repo (`c:\Users\Admin\Downloads\POE master`)
- Giữ nguyên: `docs/` (specs & plans), `.git/`

- [ ] **Step 1: Chạy scaffold Starlight vào thư mục hiện tại**

Run (PowerShell, ở thư mục gốc repo):
```
npm create astro@latest . -- --template starlight --typescript strict --no-install --no-git --skip-houston --yes
```
Expected: tạo `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/content/docs/`, `src/content.config.ts` (hoặc `src/content/config.ts`), `public/`. Lệnh tự xác nhận khi thư mục không trống nhờ `--yes`.

Nếu lệnh từ chối vì thư mục không trống: scaffold vào thư mục tạm rồi chép sang —
```
npm create astro@latest .astro-tmp -- --template starlight --typescript strict --no-install --no-git --skip-houston --yes
```
rồi chép toàn bộ nội dung `.astro-tmp` (gồm file ẩn) ra gốc và xóa `.astro-tmp`.

- [ ] **Step 2: Cài dependencies**

Run: `npm install`
Expected: tạo `node_modules/` và `package-lock.json`, không lỗi.

- [ ] **Step 3: Cài plugin kiểm link nội bộ**

Run: `npm install starlight-links-validator`
Expected: thêm `starlight-links-validator` vào `dependencies`.

- [ ] **Step 4: Chạy thử dev server**

Run: `npm run dev`
Expected: in ra `Local: http://localhost:4321/`. Mở trình duyệt thấy trang Starlight mặc định. Dừng server (Ctrl+C) sau khi xác nhận.

- [ ] **Step 5: Tạo .gitignore (nếu scaffold chưa tạo) và commit**

Đảm bảo `.gitignore` có: `node_modules/`, `dist/`, `.astro/`, `.astro-tmp/`.
```
git add -A
git commit -m "chore: scaffold Astro + Starlight project"
```

---

### Task 2: Cấu hình Astro/Starlight (tiếng Việt, tiêu đề, plugin link)

**Files:**
- Modify: `astro.config.mjs`
- Modify: `tsconfig.json` (thêm path alias `@components`)

- [ ] **Step 1: Ghi đè `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// LƯU Ý: cập nhật `site` và `base` ở Task 7 sau khi biết tên repo GitHub.
export default defineConfig({
  integrations: [
    starlight({
      title: 'Master POE 2',
      description: 'Lộ trình học Path of Exile 2 từ A→Z bằng tiếng Việt cho người mới.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Tiếng Việt', lang: 'vi' },
      },
      lastUpdated: true,
      plugins: [starlightLinksValidator()],
      sidebar: [
        // Sidebar đầy đủ được điền ở Task 5.
      ],
    }),
  ],
});
```

- [ ] **Step 2: Thêm path alias vào `tsconfig.json`**

Trong object `compilerOptions`, thêm (giữ nguyên các trường có sẵn như `extends`):
```json
"baseUrl": ".",
"paths": {
  "@components/*": ["src/components/*"]
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build thành công, in `Complete!`, tạo thư mục `dist/`. Không có cảnh báo link hỏng (chưa có link nội bộ tùy biến nên sẽ sạch).

- [ ] **Step 4: Commit**

```
git add astro.config.mjs tsconfig.json
git commit -m "feat: configure Starlight for Vietnamese + link validator"
```

---

### Task 3: Component khuôn bài học `Hop.astro`

**Files:**
- Create: `src/components/Hop.astro`
- Create: `src/content/docs/_demo-hop.mdx` (trang demo tạm để kiểm tra render; xóa ở cuối task)

- [ ] **Step 1: Tạo `src/components/Hop.astro`**

```astro
---
const variants = {
  thuatngu: { title: '📦 Thuật ngữ Anh–Việt', cls: 'v-thuatngu' },
  nguon:    { title: '🔗 Nguồn gốc',          cls: 'v-nguon' },
  mauchot:  { title: '✅ Điểm mấu chốt',       cls: 'v-mauchot' },
};
const { variant = 'thuatngu', title } = Astro.props;
const v = variants[variant] ?? variants.thuatngu;
const heading = title ?? v.title;
---
<div class={`hop ${v.cls}`}>
  <p class="hop-title">{heading}</p>
  <div class="hop-body"><slot /></div>
</div>
<style>
  .hop { border: 1px solid var(--sl-color-gray-5); border-left-width: 4px; border-radius: 0.5rem; padding: 0.75rem 1rem; margin: 1.25rem 0; background: var(--sl-color-gray-6); }
  .hop-title { font-weight: 700; margin: 0 0 0.5rem; }
  .hop-body :global(p:last-child) { margin-bottom: 0; }
  .v-thuatngu { border-left-color: var(--sl-color-blue); }
  .v-nguon    { border-left-color: var(--sl-color-purple); }
  .v-mauchot  { border-left-color: var(--sl-color-green); }
</style>
```

- [ ] **Step 2: Tạo trang demo `src/content/docs/_demo-hop.mdx`**

```mdx
---
title: Demo Hộp
---
import Hop from '@components/Hop.astro';

<Hop variant="thuatngu">
| Tiếng Anh | Tiếng Việt |
|-----------|------------|
| Skill Gem | Ngọc kỹ năng |
| Currency  | Tiền tệ / vật phẩm quy đổi |
</Hop>

<Hop variant="nguon">
- [POE2 Wiki](https://www.poewiki.net/)
</Hop>

<Hop variant="mauchot">
- Đây là điểm mấu chốt mẫu.
</Hop>
```

- [ ] **Step 3: Verify render trên dev server**

Run: `npm run dev` rồi mở `http://localhost:4321/_demo-hop`.
Expected: thấy 3 hộp có tiêu đề và viền màu khác nhau; bảng thuật ngữ hiển thị đúng. Dừng server.

- [ ] **Step 4: Verify build sạch**

Run: `npm run build`
Expected: build thành công, link validator không báo lỗi.

- [ ] **Step 5: Xóa trang demo và commit**

Xóa `src/content/docs/_demo-hop.mdx`.
```
git add -A
git commit -m "feat: add reusable Hop component (glossary/sources/keypoints)"
```

---

### Task 4: Trang chủ (landing) tiếng Việt

**Files:**
- Modify/Replace: `src/content/docs/index.mdx` (Starlight scaffold tạo sẵn trang splash; thay nội dung)

- [ ] **Step 1: Ghi đè `src/content/docs/index.mdx`**

```mdx
---
title: Master POE 2
description: Lộ trình học Path of Exile 2 từ A→Z bằng tiếng Việt cho người mới.
template: splash
hero:
  tagline: Học Path of Exile 2 từ con số 0 đến tự build, tự kiếm tiền — bằng tiếng Việt.
  actions:
    - text: Bắt đầu học (Chương 0)
      link: /lo-trinh/chuong-0-nhap-mon/
      icon: right-arrow
      variant: primary
---

import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <Card title="📚 Lộ trình học A→Z" icon="open-book">
    11 chương từ tân thủ đến endgame, kiếm tiền và tự build.
  </Card>
  <Card title="🛠️ Công cụ Build" icon="setting">
    Máy tính / planner build — đang phát triển.
  </Card>
  <Card title="💰 Dashboard Kiếm tiền" icon="rocket">
    Giá cả, chiến lược farm, ROI — đang phát triển.
  </Card>
  <Card title="🧠 Ghi chú cá nhân" icon="pencil">
    Knowledge hub ghi chú & liên kết kiến thức — đang phát triển.
  </Card>
</CardGrid>
```

- [ ] **Step 2: Verify build (link `/lo-trinh/chuong-0-nhap-mon/` sẽ báo hỏng cho tới Task 5)**

Run: `npm run build`
Expected: link validator có thể báo link tới Chương 0 chưa tồn tại — chấp nhận tạm; sẽ hết sau Task 5. (Nếu muốn build sạch ngay, làm Task 5 trước rồi quay lại verify.)

- [ ] **Step 3: Commit**

```
git add src/content/docs/index.mdx
git commit -m "feat: Vietnamese landing page with 4-zone overview"
```

---

### Task 5: Sidebar 4 khu + khung 11 chương + 3 trang "đang phát triển"

**Files:**
- Modify: `astro.config.mjs` (điền `sidebar`)
- Create: `src/content/docs/lo-trinh/chuong-0-nhap-mon/index.md` … `chuong-10-tai-nguyen-patch/index.md` (11 file index)
- Create: `src/content/docs/cong-cu-build/index.md`
- Create: `src/content/docs/kiem-tien/index.md`
- Create: `src/content/docs/ghi-chu/index.md`

Quy ước slug chương:
`chuong-0-nhap-mon`, `chuong-1-class-ascendancy`, `chuong-2-co-che-cot-loi`, `chuong-3-campaign`, `chuong-4-passive-tree`, `chuong-5-trang-bi`, `chuong-6-crafting`, `chuong-7-endgame-atlas`, `chuong-8-kinh-te-kiem-tien`, `chuong-9-build-theorycraft`, `chuong-10-tai-nguyen-patch`.

- [ ] **Step 1: Tạo 11 file `index.md` cho các chương**

Mỗi file dùng mẫu sau (thay `<TÊN>` và `<MÔ TẢ NGẮN>` theo bảng bên dưới):
```md
---
title: <TÊN>
description: <MÔ TẢ NGẮN>
lastUpdated: 2026-05-27
---

> 🚧 Chương này đang được biên soạn. Mục lục bài học sẽ xuất hiện ở đây.

Nội dung dự kiến của chương: xem [tài liệu thiết kế](/lo-trinh/chuong-10-tai-nguyen-patch/) và lộ trình tổng thể.
```

Bảng tên & mô tả:
| Slug | title | description |
|------|-------|-------------|
| chuong-0-nhap-mon | Chương 0 — Nhập môn | POE2 là game gì, vòng lặp cốt lõi, thuật ngữ nền tảng |
| chuong-1-class-ascendancy | Chương 1 — Class & Ascendancy | Chọn nhân vật, chỉ số gốc, chuyển class |
| chuong-2-co-che-cot-loi | Chương 2 — Cơ chế cốt lõi | Skill gem, Spirit, sát thương, phòng thủ |
| chuong-3-campaign | Chương 3 — Đi cốt truyện | Hướng dẫn từng Act, chơi dễ nhất |
| chuong-4-passive-tree | Chương 4 — Cây kỹ năng bị động | Đọc passive tree, PoB2 |
| chuong-5-trang-bi | Chương 5 — Trang bị & Vật phẩm | Độ hiếm, affix, đọc đồ ngon |
| chuong-6-crafting | Chương 6 — Chế đồ (Crafting) | Currency orb, essence, công thức cơ bản |
| chuong-7-endgame-atlas | Chương 7 — Endgame: Atlas & Maps | Waystone, cây Atlas, cơ chế map |
| chuong-8-kinh-te-kiem-tien | Chương 8 — Kinh tế & Kiếm tiền | Currency giá trị, trade, farm, ROI |
| chuong-9-build-theorycraft | Chương 9 — Tự cook Build | Thiết kế build, PoB2 sâu |
| chuong-10-tai-nguyen-patch | Chương 10 — Tài nguyên & Patch | Nguồn gốc, theo dõi thay đổi |

(Bỏ dòng link tới thiết kế trong file `chuong-10` để tránh tự trỏ; thay bằng câu "Danh sách nguồn sẽ xuất hiện ở đây.")

- [ ] **Step 2: Tạo 3 trang khu công cụ "đang phát triển"**

`src/content/docs/cong-cu-build/index.md`:
```md
---
title: 🛠️ Công cụ Build / Theorycraft
description: Máy tính và planner build cho POE2 — đang phát triển.
---

> 🚧 **Đang phát triển.** Khu này sẽ là công cụ tính toán & lên kế hoạch build. Hiện tại hãy dùng [Lộ trình học](/lo-trinh/chuong-0-nhap-mon/) và Path of Building 2.
```
`src/content/docs/kiem-tien/index.md`:
```md
---
title: 💰 Dashboard Kiếm tiền
description: Theo dõi giá cả, chiến lược farm, ROI — đang phát triển.
---

> 🚧 **Đang phát triển.** Khu này sẽ theo dõi giá & chiến lược kiếm currency. Hiện tại xem [Chương 8 — Kinh tế & Kiếm tiền](/lo-trinh/chuong-8-kinh-te-kiem-tien/).
```
`src/content/docs/ghi-chu/index.md`:
```md
---
title: 🧠 Ghi chú cá nhân
description: Knowledge hub ghi chú & liên kết kiến thức — đang phát triển.
---

> 🚧 **Đang phát triển.** Khu này sẽ cho ghi chú và liên kết kiến thức cá nhân.
```

- [ ] **Step 3: Điền `sidebar` trong `astro.config.mjs`**

Thay mảng `sidebar: []` bằng:
```js
sidebar: [
  {
    label: '📚 Lộ trình học A→Z',
    items: [
      { label: 'Chương 0 — Nhập môn', link: '/lo-trinh/chuong-0-nhap-mon/' },
      { label: 'Chương 1 — Class & Ascendancy', link: '/lo-trinh/chuong-1-class-ascendancy/' },
      { label: 'Chương 2 — Cơ chế cốt lõi', link: '/lo-trinh/chuong-2-co-che-cot-loi/' },
      { label: 'Chương 3 — Đi cốt truyện', link: '/lo-trinh/chuong-3-campaign/' },
      { label: 'Chương 4 — Passive Tree', link: '/lo-trinh/chuong-4-passive-tree/' },
      { label: 'Chương 5 — Trang bị & Vật phẩm', link: '/lo-trinh/chuong-5-trang-bi/' },
      { label: 'Chương 6 — Chế đồ (Crafting)', link: '/lo-trinh/chuong-6-crafting/' },
      { label: 'Chương 7 — Endgame: Atlas & Maps', link: '/lo-trinh/chuong-7-endgame-atlas/' },
      { label: 'Chương 8 — Kinh tế & Kiếm tiền', link: '/lo-trinh/chuong-8-kinh-te-kiem-tien/' },
      { label: 'Chương 9 — Tự cook Build', link: '/lo-trinh/chuong-9-build-theorycraft/' },
      { label: 'Chương 10 — Tài nguyên & Patch', link: '/lo-trinh/chuong-10-tai-nguyen-patch/' },
    ],
  },
  { label: '🛠️ Công cụ Build', link: '/cong-cu-build/' },
  { label: '💰 Dashboard Kiếm tiền', link: '/kiem-tien/' },
  { label: '🧠 Ghi chú cá nhân', link: '/ghi-chu/' },
],
```

- [ ] **Step 4: Verify build sạch (link nội bộ)**

Run: `npm run build`
Expected: build thành công; starlight-links-validator **không** báo link hỏng (tất cả link sidebar + link trang chủ giờ đã có đích).

- [ ] **Step 5: Verify nav trên dev server**

Run: `npm run dev`. Mở trang chủ, bấm "Bắt đầu học" → tới Chương 0. Kiểm tra sidebar hiện 4 khu, 11 chương. Thu nhỏ cửa sổ kiểm tra responsive (sidebar gập lại trên khổ điện thoại). Dừng server.

- [ ] **Step 6: Commit**

```
git add -A
git commit -m "feat: sidebar 4 zones + 11 chapter skeletons + coming-soon pages"
```

---

### Task 6: Quy ước nội dung & "luật vàng" cho người viết (tài liệu nội bộ)

**Files:**
- Create: `docs/superpowers/content-guide.md`

Mục đích: mọi task viết nội dung (Phần 2) tuân theo cùng một khuôn & nguồn, đảm bảo nhất quán và chính xác.

- [ ] **Step 1: Tạo `docs/superpowers/content-guide.md`**

```md
# Hướng dẫn biên soạn nội dung (bắt buộc đọc trước khi viết chương)

## Khuôn mỗi trang bài học (.mdx trong src/content/docs/lo-trinh/<chuong>/)
Frontmatter:
```
---
title: <Tên bài>
description: <1 câu>
lastUpdated: <YYYY-MM-DD ngày viết>
---
```
Thân bài, theo thứ tự:
1. Aside mở đầu: `:::tip[👉 Bài này bạn sẽ hiểu được]` … `:::`
2. Nội dung tiếng Việt: giải thích + ví dụ + **hướng dẫn thực hành "làm thế này"** (không chỉ lý thuyết — người dùng muốn chơi dễ nhất).
3. `<Hop variant="thuatngu">` chứa bảng Anh–Việt các thuật ngữ trong bài (để người dùng nhận ra từ tiếng Anh trong game).
4. `<Hop variant="nguon">` chứa link nguồn chính thống đã dùng.
5. (Nếu có số liệu hay đổi) Aside `:::note[📊 Số liệu sống]` chứa link poe.ninja / Trade — KHÔNG viết cứng con số vào bài.
6. `<Hop variant="mauchot">` 3–5 gạch đầu dòng tóm tắt.

Import ở đầu file: `import Hop from '@components/Hop.astro';`

## Nguồn chính thống được phép dùng
- Trang chủ & patch notes chính thức POE2 (pathofexile.com)
- POE Wiki (poewiki.net) / POE2 Wiki
- poe2db.tw
- Maxroll POE2 (maxroll.gg)
- Path of Building 2 (github)
- poe.ninja (số liệu kinh tế — chỉ link, không hardcode)

## Luật vàng
- Đối chiếu mọi khẳng định với ít nhất 1 nguồn ở trên; nghi ngờ thì ghi rõ "có thể đổi theo patch".
- POE2 đang Early Access: ưu tiên thông tin mới nhất; ghi `lastUpdated`.
- Tiếng Việt dễ hiểu cho tân thủ; lần đầu nhắc thuật ngữ thì kèm tiếng Anh trong ngoặc.
- Sau khi viết: `npm run build` phải sạch (link validator không báo lỗi).
```

- [ ] **Step 2: Commit**

```
git add docs/superpowers/content-guide.md
git commit -m "docs: content authoring guide (template + sources + rules)"
```

---

### Task 7: Deploy lên GitHub Pages (cần tài khoản GitHub của người dùng)

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs` (điền `site` + `base`)

> ⚠️ Task này cần tương tác với người dùng: xác nhận họ **có tài khoản GitHub** và **tạo 1 repo**. Nếu chưa có/không muốn → dùng phương án Netlify (drag-drop thư mục `dist/` lên app.netlify.com, hoặc kết nối repo). Ghi rõ và hỏi người dùng trước khi chạy.

- [ ] **Step 1: Hỏi & lấy thông tin GitHub**

Hỏi người dùng: username GitHub và tên repo (gợi ý `poe2-master`). Tạo repo trống trên GitHub (qua web hoặc `gh repo create`).

- [ ] **Step 2: Điền `site` + `base` trong `astro.config.mjs`**

Với project page `https://<user>.github.io/<repo>/`:
```js
site: 'https://<user>.github.io',
base: '/<repo>',
```
(Đặt 2 dòng này trong object `defineConfig({...})`, cùng cấp với `integrations`.)

- [ ] **Step 3: Tạo workflow `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Bật GitHub Pages + push**

Trên GitHub: Settings → Pages → Source = **GitHub Actions**. Sau đó:
```
git remote add origin https://github.com/<user>/<repo>.git
git add -A
git commit -m "ci: GitHub Pages deploy workflow"
git branch -M main
git push -u origin main
```
Expected: tab Actions chạy workflow "Deploy to GitHub Pages" xanh; site lên `https://<user>.github.io/<repo>/`.

- [ ] **Step 5: Verify site live**

Mở URL trên cả PC và điện thoại. Kiểm tra trang chủ, nav, 1 trang chương load đúng, link nội bộ không 404 (chú ý `base` phải đúng).

- [ ] **Step 6: Commit (đã push ở trên)** — xác nhận `git status` sạch.

---

## PHẦN 2 — VIẾT NỘI DUNG 11 CHƯƠNG

**Quy trình chung mỗi task chương (theo `docs/superpowers/content-guide.md`):**
viết các trang `.mdx` theo khuôn → đối chiếu nguồn chính thống → `npm run build` sạch → xem dev server render đúng → commit. Mỗi chương là 1 task; mỗi bài trong chương là 1 file `.mdx` riêng trong thư mục chương, và được thêm vào `items` của chương đó trong `sidebar` (chuyển chương từ `link` đơn sang `{ label, items: [...] }`).

> Nội dung prose tiếng Việt được viết tại thời điểm thực thi (không pre-write trong plan). Plan quy định **trang nào, mục nào, nguồn nào, verify ra sao** cho từng chương.

---

### Task 8: Nội dung Chương 0 — Nhập môn

**Files (tạo trong `src/content/docs/lo-trinh/chuong-0-nhap-mon/`):**
- Modify: `index.md` → đổi thành trang tổng quan chương + mục lục
- Create: `arpg-va-vong-lap.mdx` — ARPG là gì, vòng lặp cốt lõi (nhặt đồ → mạnh hơn → giết nhanh hơn)
- Create: `early-access.mdx` — Early Access nghĩa là gì, vì sao game hay đổi
- Create: `league-vs-standard.mdx` — League/Mùa giải vs Standard, nên chơi gì
- Create: `bang-thuat-ngu.mdx` — bảng thuật ngữ nền tảng Anh–Việt (build, meta, endgame, currency, gem...)

**Nguồn:** trang chính thức POE2, POE Wiki (giải thích league/standard), poe2db.

- [ ] **Step 1:** Viết 4 file `.mdx` theo khuôn trong content-guide (mỗi file đủ 6 phần). `bang-thuat-ngu.mdx` là 1 bảng Anh–Việt lớn trong `<Hop variant="thuatngu">`.
- [ ] **Step 2:** Cập nhật `index.md` của chương: bỏ dòng 🚧, thêm 1 đoạn giới thiệu + danh sách link tới 4 bài.
- [ ] **Step 3:** Sửa `sidebar` (astro.config.mjs): chuyển Chương 0 thành `{ label: 'Chương 0 — Nhập môn', items: [ {label, link 'index'}, ...4 bài ] }`.
- [ ] **Step 4: Verify** `npm run build` sạch; `npm run dev` xem 4 trang render đúng, hộp & bảng hiển thị ổn.
- [ ] **Step 5: Commit** `git add -A && git commit -m "content: Chương 0 — Nhập môn"`

---

### Task 9: Nội dung Chương 1 — Class & Ascendancy

**Files (`.../chuong-1-class-ascendancy/`):**
- Modify: `index.md` (tổng quan + mục lục)
- Create: `chi-so-goc.mdx` — Str/Dex/Int và ý nghĩa
- Create: `cac-class.mdx` — các class hiện có + phong cách chơi
- Create: `ascendancy.mdx` — Ascendancy là gì, mở khóa thế nào
- Create: `class-cho-nguoi-moi.mdx` — gợi ý class dễ cho tân thủ + lý do (hướng "chơi dễ nhất")

**Nguồn:** trang chính thức POE2 (Classes/Ascendancies), poe2db, Maxroll (class overview).

- [ ] **Step 1:** Viết các file theo khuôn. Lưu ý số lượng/tên class có thể đổi theo patch → ghi `lastUpdated` và link nguồn.
- [ ] **Step 2:** Cập nhật `index.md`.
- [ ] **Step 3:** Thêm Chương 1 vào sidebar dạng `items`.
- [ ] **Step 4: Verify** build sạch + xem dev.
- [ ] **Step 5: Commit** `content: Chương 1 — Class & Ascendancy`

---

### Task 10: Nội dung Chương 2 — Cơ chế cốt lõi

**Files (`.../chuong-2-co-che-cot-loi/`):**
- Modify: `index.md`
- Create: `skill-gem-support.mdx` — ngọc kỹ năng & ngọc hỗ trợ (khác POE1: uncut gems, slot hỗ trợ)
- Create: `spirit.mdx` — cơ chế Spirit (aura/buff/minion)
- Create: `sat-thuong-va-hieu-ung.mdx` — loại sát thương + ailment (cháy/đóng băng/sốc/độc/chảy máu)
- Create: `phong-thu.mdx` — giáp/né/khiên năng lượng/kháng/đỡ; vì sao kháng quan trọng
- Create: `mau-mana-flask.mdx` — máu/mana/flask

**Nguồn:** POE Wiki (gems, damage, ailments, defences), poe2db, patch notes (Spirit).

- [ ] **Step 1:** Viết các file theo khuôn (đây là chương "vỡ lòng" quan trọng — giải thích kỹ, nhiều ví dụ thực hành).
- [ ] **Step 2:** Cập nhật `index.md`.
- [ ] **Step 3:** Thêm vào sidebar dạng `items`.
- [ ] **Step 4: Verify** build sạch + xem dev.
- [ ] **Step 5: Commit** `content: Chương 2 — Cơ chế cốt lõi`

---

### Task 11: Nội dung Chương 3 — Đi cốt truyện (Campaign)

**Files (`.../chuong-3-campaign/`):**
- Modify: `index.md` (tổng quan + nguyên tắc sống còn)
- Create: `nguyen-tac-song-con.mdx` — luôn đủ kháng, cập nhật gear/skill, tránh "đụng tường"
- Create: `act-1.mdx`, `act-2.mdx`, `act-3.mdx` — hướng dẫn **từng act, từng bước** (mạch đi, boss chính, lưu ý)
- Create: `do-kho-cruel.mdx` — vòng Cruel/độ khó lặp lại
- Create: `meo-len-cap.mdx` — mẹo lên cấp & qua story nhanh

> Số act/cấu trúc campaign đổi theo phiên bản EA → kiểm chứng số act hiện tại từ nguồn trước khi viết; nếu nhiều/ít hơn 3 act, tạo thêm/bớt file `act-N.mdx` tương ứng và cập nhật mục lục + sidebar.

**Nguồn:** trang chính thức POE2 (campaign), Maxroll/PoE2 leveling guides, POE Wiki (acts).

- [ ] **Step 1:** Kiểm chứng số act hiện tại từ nguồn → quyết định số file `act-N.mdx`.
- [ ] **Step 2:** Viết các file theo khuôn, nhấn mạnh hướng dẫn thực hành "đi đường nào, đánh boss ra sao".
- [ ] **Step 3:** Cập nhật `index.md` + thêm vào sidebar dạng `items`.
- [ ] **Step 4: Verify** build sạch + xem dev.
- [ ] **Step 5: Commit** `content: Chương 3 — Campaign`

---

### Task 12: Nội dung Chương 4 — Cây kỹ năng bị động (Passive Tree)

**Files (`.../chuong-4-passive-tree/`):**
- Modify: `index.md`
- Create: `doc-cay-passive.mdx` — node thường/notable/keystone/ô ngọc
- Create: `path-of-building-2.mdx` — PoB2 là gì, cài & dùng cơ bản (công cụ bắt buộc biết)
- Create: `cong-don-sat-thuong.mdx` — tư duy cộng dồn sát thương/phòng thủ cơ bản

**Nguồn:** PoB2 (github), POE Wiki (passive skill tree), Maxroll.

- [ ] **Step 1–5:** như khuôn chung (viết → index → sidebar items → verify build/dev → commit `content: Chương 4 — Passive Tree`).

---

### Task 13: Nội dung Chương 5 — Trang bị & Vật phẩm

**Files (`.../chuong-5-trang-bi/`):**
- Modify: `index.md`
- Create: `do-hiem.mdx` — normal/magic/rare/unique
- Create: `affix-va-ilvl.mdx` — tiền tố/hậu tố, item level, base
- Create: `doc-mot-mon-do.mdx` — cách đánh giá một món đồ "ngon" (thực hành)

**Nguồn:** POE Wiki (item, affix, item level), poe2db.

- [ ] **Step 1–5:** khuôn chung → commit `content: Chương 5 — Trang bị & Vật phẩm`.

---

### Task 14: Nội dung Chương 6 — Chế đồ (Crafting)

**Files (`.../chuong-6-crafting/`):**
- Modify: `index.md`
- Create: `currency-orbs.mdx` — từng orb làm gì (Transmute/Aug/Alch/Chaos/Exalt/Divine...) — bảng Anh–Việt lớn
- Create: `essence-rune-omen.mdx` — các cơ chế craft khác
- Create: `cong-thuc-co-ban.mdx` — vài công thức craft an toàn cho người mới (thực hành)

> Cơ chế currency POE2 khác POE1 đáng kể → kiểm chứng kỹ từng orb từ poe2db/Wiki trước khi viết.

**Nguồn:** poe2db, POE Wiki (currency, crafting), patch notes.

- [ ] **Step 1–5:** khuôn chung → commit `content: Chương 6 — Crafting`.

---

### Task 15: Nội dung Chương 7 — Endgame: Atlas & Maps

**Files (`.../chuong-7-endgame-atlas/`):**
- Modify: `index.md`
- Create: `mo-khoa-endgame.mdx` — endgame mở ra thế nào sau campaign
- Create: `waystone-va-map.mdx` — waystone/map hoạt động ra sao
- Create: `cay-atlas.mdx` — cây Atlas, cách phân bổ điểm
- Create: `co-che-trong-map.mdx` — Breach/Ritual/Expedition/Delirium... (mỗi cơ chế 1 đoạn)
- Create: `pinnacle-boss.mdx` — boss đỉnh, đường tới

**Nguồn:** POE Wiki (Atlas, maps, mechanics), Maxroll (atlas guide), poe2db.

- [ ] **Step 1–5:** khuôn chung → commit `content: Chương 7 — Endgame Atlas`.

---

### Task 16: Nội dung Chương 8 — Kinh tế & Kiếm tiền 💰

**Files (`.../chuong-8-kinh-te-kiem-tien/`):**
- Modify: `index.md`
- Create: `currency-gia-tri.mdx` — currency nào thực sự đáng giá & vì sao (link poe.ninja, không hardcode giá)
- Create: `trade-va-dinh-gia.mdx` — dùng trang Trade, cách tìm & định giá đồ (thực hành)
- Create: `cac-cach-farm.mdx` — chạy map / đánh boss / craft bán / đầu tư
- Create: `tu-duy-roi.mdx` — bỏ thời gian vào đâu lời nhất

**Nguồn:** poe.ninja (số liệu — chỉ link), trang Trade chính thức, Maxroll (currency/strategy guides).

- [ ] **Step 1–5:** khuôn chung; chú ý mọi con số giá đều qua Aside "📊 Số liệu sống" link ra ngoài → commit `content: Chương 8 — Kinh tế & Kiếm tiền`.

---

### Task 17: Nội dung Chương 9 — Tự cook Build & Theorycraft 🔨

**Files (`.../chuong-9-build-theorycraft/`):**
- Modify: `index.md`
- Create: `quy-trinh-thiet-ke-build.mdx` — các bước tự nghĩ ra một build từ đầu
- Create: `pob2-nang-cao.mdx` — dùng PoB2 ở mức sâu để kiểm chứng build
- Create: `doc-meta-va-bien-tau.mdx` — cách đọc build meta rồi biến tấu theo ý mình

**Nguồn:** PoB2, Maxroll (build guides — để học cách trình bày), poe.ninja builds.

- [ ] **Step 1–5:** khuôn chung → commit `content: Chương 9 — Build & Theorycraft`.

---

### Task 18: Nội dung Chương 10 — Tài nguyên & Cập nhật theo patch

**Files (`.../chuong-10-tai-nguyen-patch/`):**
- Modify: `index.md`
- Create: `nguon-goc.mdx` — danh sách nguồn chính thống (poe2db, Wiki, Maxroll, PoB2, poe.ninja, patch notes) + mô tả từng nguồn dùng để làm gì
- Create: `theo-doi-patch.mdx` — cách đọc patch notes & nhận biết khi nội dung site cần cập nhật

**Nguồn:** chính các trang nguồn ở trên.

- [ ] **Step 1–5:** khuôn chung → commit `content: Chương 10 — Tài nguyên & Patch`.

---

## SELF-REVIEW (đã thực hiện khi viết plan)

- **Spec coverage:** 4 khu (Task 4,5) ✓; 11 chương (Task 8–18) ✓; khuôn trang + component (Task 3,6) ✓; tiếng Việt + locale (Task 2) ✓; nguồn chính thống + không hardcode số liệu (Task 6, 16) ✓; campaign từng act (Task 11) ✓; build/link check (mọi task verify) ✓; deploy GitHub Pages (Task 7) ✓; theo dõi patch (Task 18) ✓.
- **Placeholder scan:** nội dung prose chương cố ý viết khi thực thi (đặc tả đủ trang/mục/nguồn/verify) — không phải placeholder kỹ thuật. Code khung đã đầy đủ.
- **Type/Naming consistency:** component `Hop` với prop `variant` ('thuatngu'|'nguon'|'mauchot') dùng nhất quán; alias `@components/*`; slug chương nhất quán giữa file, sidebar, link trang chủ.

## Lưu ý cập nhật khi thực thi
Mỗi task chương khi chuyển mục sidebar từ `link` sang `items`, NHỚ giữ một item trỏ tới `index` của chương (trang tổng quan) để không mất link tổng quan.
