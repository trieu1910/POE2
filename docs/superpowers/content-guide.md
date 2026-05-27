# Hướng dẫn biên soạn nội dung — Master POE 2

Tài liệu này dành cho người viết bài học trong `src/content/docs/lo-trinh/`. Đọc kỹ trước khi tạo file mới.

---

## 1. Khuôn mỗi trang bài học

Mỗi bài học là một file `.mdx` nằm trong `src/content/docs/lo-trinh/<chuong>/`. Đặt tên theo slug của chương, ví dụ: `chuong-0-nhap-mon/bai-01-poe2-la-gi.mdx`.

> **Ngoại lệ:** File `index.md` của mỗi chương là **trang tổng quan chương** (giới thiệu + danh sách link tới các bài). Nó KHÔNG cần theo khuôn bài học (không cần import `Hop`, không cần các block glossary/nguồn/mấu chốt). Chỉ các file bài học `.mdx` mới theo khuôn dưới đây.

> **Số liệu cơ chế (per-point, công thức):** các con số như "mỗi điểm Str cho +X máu" là loại **dễ sai và đổi giữa POE1↔POE2 và theo patch**. Nếu không xác nhận được từ nguồn chính thống/poewiki/poe2db, hãy **mô tả tác dụng định tính** (Str→máu & yêu cầu đồ Str…) thay vì khẳng định con số; nếu có nêu số, kèm "*(theo \\<nguồn\\>, có thể đổi theo patch)*" và link.

### Import bắt buộc

Dòng đầu tiên của phần body (ngay sau frontmatter) phải là:

    import Hop from '@components/Hop.astro';

### Frontmatter

```yaml
---
title: <Tên bài học>
description: <Mô tả ngắn 1 câu>
lastUpdated: <YYYY-MM-DD ngày viết hoặc sửa lần cuối>
---
```

- `title`: Tên bài, viết đầy đủ, có số thứ tự nếu cần (VD: "Bài 1 — POE2 là game gì?")
- `description`: Hiện ra ở preview card và SEO — viết 1 câu súc tích.
- `lastUpdated`: Ngày viết / sửa cuối cùng theo định dạng `YYYY-MM-DD`. POE2 đang Early Access nên luôn cập nhật trường này khi patch thay đổi nội dung.

### Thứ tự các phần trong body

Giữ đúng thứ tự sau để nhất quán trên toàn site:

#### (1) Aside mở bài — Mục tiêu bài học

````mdx
:::tip[👉 Bài này bạn sẽ hiểu được]
- Điểm A
- Điểm B
- Điểm C
:::
````

Liệt kê 2–4 bullet nói rõ người đọc sẽ **biết / làm được gì** sau khi đọc xong. Không viết chung chung kiểu "bạn sẽ hiểu game hơn".

#### (2) Nội dung chính bằng tiếng Việt

- Giải thích cơ chế + ví dụ cụ thể (con số, item, boss thật trong game).
- Luôn có phần **"làm thế này"** — hướng dẫn thực hành theo cách dễ nhất, không chỉ lý thuyết. Người đọc muốn chơi được, không phải thi nghiên cứu sinh.
- Mỗi lần xuất hiện thuật ngữ tiếng Anh lần đầu, viết kèm nghĩa/phiên âm trong ngoặc đơn. VD: "Waystone (đá mở cổng bản đồ)". Các lần sau có thể dùng tiếng Anh bình thường.
- Không hardcode các con số có thể thay đổi theo patch (giá currency, tỉ lệ drop, v.v.). Thay vào đó, link đến poe.ninja hoặc ghi chú "xem bảng giá thực tế tại…".

#### (3) Glossary — Bảng thuật ngữ Anh–Việt

Dùng component `<Hop variant="thuatngu">` bao quanh một bảng Markdown:

````mdx
<Hop variant="thuatngu">

| Tiếng Anh | Tiếng Việt / Giải thích |
|-----------|------------------------|
| Waystone  | Đá mở cổng bản đồ      |
| Atlas     | Bản đồ thế giới endgame |

</Hop>
````

Liệt kê **tất cả** thuật ngữ tiếng Anh xuất hiện trong bài, để người đọc nhận ra chúng khi thấy trong game UI.

> Nếu bài có nhiều thuật ngữ, **được phép** chia thành nhiều block `<Hop variant="thuatngu">` theo nhóm chủ đề (mỗi nhóm một bảng, có thể kèm một dòng tiêu đề nhóm phía trên) để dễ đọc. Đây là cách làm hợp lệ, không bắt buộc gộp tất cả vào một bảng duy nhất.

#### (4) Nguồn tham khảo

Dùng component `<Hop variant="nguon">` bao quanh danh sách link:

````mdx
<Hop variant="nguon">

- [Tên nguồn](https://url-nguon.com)
- [Tên nguồn 2](https://url-nguon-2.com)

</Hop>
````

Chỉ dùng các nguồn trong danh sách "Nguồn chính thống được phép dùng" (xem Mục 2).

#### (5) Aside số liệu sống — chỉ khi bài có dữ liệu biến động

Nếu bài đề cập giá cả, tỉ lệ, meta build, v.v., **bắt buộc** thêm block này thay vì hardcode số:

````mdx
:::note[📊 Số liệu sống — kiểm tra trước khi dùng]
- Giá currency thực tế: [poe.ninja/economy](https://poe.ninja/economy)
- Giá trade: [pathofexile.com/trade2](https://www.pathofexile.com/trade2)
:::
````

Không viết ví dụ kiểu "1 Divine Orb = 150 Exalted" vào trong prose — con số này thay đổi theo ngày.

#### (6) Tóm tắt mấu chốt

Dùng component `<Hop variant="mauchot">` bao quanh 3–5 bullet chốt lại:

````mdx
<Hop variant="mauchot">

- Điểm chốt 1
- Điểm chốt 2
- Điểm chốt 3

</Hop>
````

Đây là phần người đọc lướt lại khi cần ôn nhanh — viết ngắn gọn, rõ ràng, không dùng câu phức.

---

## 2. Nguồn chính thống được phép dùng

Chỉ trích dẫn và link đến các nguồn sau. Không dùng nguồn cá nhân chưa kiểm chứng, không dùng Reddit hoặc YouTube làm nguồn số liệu gốc (có thể dùng để minh họa phong cách chơi).

| Nguồn | URL | Dùng cho |
|-------|-----|---------|
| Trang chính thức POE2 & patch notes | https://www.pathofexile.com/poe2 | Cơ chế, thay đổi patch |
| POE Wiki | https://www.poewiki.net | Tra cứu item, skill, mechanic |
| poe2db.tw | https://poe2db.tw | Database item/skill chi tiết |
| Maxroll POE2 | https://maxroll.gg/poe2 | Build guide, mechanic guide |
| Path of Building 2 (PoB2) | https://github.com/PathOfBuildingCommunity/PathOfBuilding-PoE2 | Tính toán build (repo bản POE2) |
| poe.ninja | https://poe.ninja | Giá currency & economy — **link only, không hardcode số** |
| Trang trade chính thức | https://www.pathofexile.com/trade2 | Kiểm tra giá thực tế |

**Lưu ý**: poe.ninja chỉ được dùng dưới dạng link tham chiếu. Tuyệt đối không copy số liệu từ poe.ninja vào bài viết vì giá thay đổi theo giờ.

---

## 3. Luật vàng

### Cross-check mọi thông tin

Trước khi viết một khẳng định về cơ chế, công thức, hay số liệu, hãy xác nhận với ít nhất **1 nguồn chính thống** trong danh sách Mục 2. Nếu 2 nguồn mâu thuẫn nhau, ưu tiên patch notes chính thức gần nhất.

### Đánh dấu thông tin không chắc chắn

Nếu không tìm được nguồn xác nhận hoặc thông tin có thể thay đổi sớm, thêm chú thích rõ ràng trong bài:

    > ⚠️ Thông tin này có thể đổi theo patch — kiểm tra lại trước khi dùng.

Hoặc viết inline: "*(có thể đổi theo patch)*" ngay sau câu đó.

### Ưu tiên thông tin mới nhất — POE2 Early Access

POE2 đang trong giai đoạn Early Access. Các cơ chế, số liệu, và meta thay đổi thường xuyên theo từng patch. Khi viết bài:

> **Phiên bản hiện tại (tại thời điểm soạn site, đã xác minh đa nguồn):** **0.5.0 "Return of the Ancients"** (ra mắt ~2026-05-21). Lưu ý quan trọng đã đổi so với bản đầu EA: **Cruel difficulty đã bị bỏ từ patch 0.3.0**; campaign hiện có **4 Act + 3 Interlude** đi một lần (Act 5+ dự kiến cho 1.0, các interlude là tạm thời). Roster class tới 0.4.0 gồm 8 class (thêm Huntress 0.2.0, Druid 0.4.0). Khi viết, mặc định mốc 0.5.x trừ khi xác minh được mốc mới hơn; luôn hedge nếu không chắc.

1. Kiểm tra patch notes mới nhất tại pathofexile.com trước khi bắt đầu viết.
2. Luôn ghi đúng ngày vào `lastUpdated` trong frontmatter.
3. Khi patch mới ra và ảnh hưởng đến bài đã viết, cập nhật bài ngay và sửa `lastUpdated`.

### Viết thân thiện cho người mới

- Dùng tiếng Việt tự nhiên, không dịch máy.
- Giải thích từ đầu, không assume người đọc biết POE1.
- Mỗi lần dùng thuật ngữ tiếng Anh lần đầu: viết kèm giải thích ngắn trong ngoặc đơn.
- Ưu tiên hướng dẫn **thực hành** ("làm A, rồi B, rồi C") hơn lý thuyết thuần túy.
- Nhớ mục tiêu: người đọc muốn chơi được game theo cách dễ nhất, không cần trở thành chuyên gia ngay lập tức.

### Build phải sạch trước khi commit

Sau khi viết hoặc sửa bất kỳ file nào trong `src/content/docs/`, chạy lệnh:

    npm run build

Lệnh này kích hoạt `starlight-links-validator` — nếu có link nội bộ bị hỏng, build sẽ thất bại với thông báo rõ ràng. Chỉ commit khi build thành công và không có lỗi broken link. Không commit code có build đỏ.

---

## 4. Checklist trước khi commit (tự kiểm — tránh lỗi lặp lại)

- [ ] Mỗi file bài học `.mdx` có `import Hop` ở dòng body đầu tiên, frontmatter đủ `title`/`description`/`lastUpdated`.
- [ ] Đúng thứ tự block: `:::tip` → nội dung (có phần "làm thế này") → `<Hop variant="thuatngu">` → `<Hop variant="nguon">` → (nếu có) `:::note[📊 Số liệu sống]` **NẰM SAU** `</Hop>` của nguồn, KHÔNG lồng bên trong → `<Hop variant="mauchot">` (3–5 bullet). *(Phân biệt: block `:::note[📊 Số liệu sống]` là cho dữ liệu giá/economy và phải nằm SAU nguồn. Còn ghi chú cảnh báo ngắn dạng `> ⚠️ Lưu ý: … có thể đổi theo patch` thì ĐƯỢC PHÉP đặt bên trong block nguồn — đó không phải block "Số liệu sống".)*
- [ ] Chỉ dùng **nguồn trong danh sách Mục 2** (pathofexile.com, poewiki.net, poe2db.tw, maxroll.gg, poe.ninja, trade2). KHÔNG dùng Mobalytics, Reddit, YouTube, wiki fandom, hay site rao bán làm nguồn.
- [ ] Link tới poewiki dùng namespace POE2 khi có: `https://www.poewiki.net/wiki/poe2wiki:<Trang>` (không dùng trang POE1).
- [ ] **Verify mọi link ngoài resolve được** (WebFetch) trước khi đưa vào — link validator chỉ kiểm link nội bộ, không kiểm link ngoài.
- [ ] Số liệu cơ chế (per-point, %, cooldown) định tính hoặc hedge + link; KHÔNG hardcode giá/drop%.
- [ ] `npm run build` xanh, "All internal links are valid", trước khi commit.

---

*Cập nhật lần cuối: 2026-05-27*
