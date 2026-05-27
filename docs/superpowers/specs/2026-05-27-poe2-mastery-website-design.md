# Thiết kế: Website "Master POE 2 từ A→Z" (tiếng Việt)

- **Ngày**: 2026-05-27
- **Trạng thái**: Đã được người dùng duyệt thiết kế (chờ duyệt tài liệu spec)
- **Người dùng**: Tân thủ POE 2 hoàn toàn, rào cản tiếng Anh, mục tiêu cuối là kiếm nhiều currency nhất trong game.

---

## 1. Mục tiêu & Tầm nhìn

Xây một website tiếng Việt giúp người dùng **master toàn bộ Path of Exile 2** — từ lúc mới bắt đầu đến endgame — với mục tiêu cuối là **kiếm tiền (currency) nhiều nhất** và **tự build / tự chơi mượt mà**.

Giá trị cốt lõi (điểm khác biệt so với các nguồn có sẵn như poe2db/Maxroll/Wiki):

1. **Tiếng Việt** — chắt lọc & việt hóa kiến thức từ nguồn tiếng Anh chính thống. Đây là rào cản lớn nhất của người dùng và gần như không có tài liệu POE2 tiếng Việt tử tế.
2. **Lộ trình có cấu trúc A→Z** — không phải tra cứu rời rạc mà là một con đường học rõ ràng cho tân thủ.
3. **Vừa hiểu vừa chơi dễ nhất** — mỗi phần kèm hướng dẫn thực hành "làm thế này", không chỉ lý thuyết.
4. **Luôn link nguồn gốc** — để đối chiếu khi nghi ngờ và để cập nhật theo patch.

### Phạm vi (Scope)

- **v1 (bản này)**: Khung website đầy đủ 4 khu + toàn bộ nội dung **Lộ trình học A→Z (11 chương)**, giao theo từng đợt có kiểm chứng.
- **Ngoài phạm vi v1 (làm sau)**: nội dung tương tác của 3 khu còn lại (công cụ Build, Dashboard Kiếm tiền, Knowledge hub) — v1 chỉ dựng khung trống để cắm vào sau.

---

## 2. Kiến trúc tổng thể

- **Nền tảng**: Astro + Starlight (theme tài liệu của Astro).
- **Nội dung**: viết bằng file Markdown/MDX tiếng Việt.
- **Giao diện** (mặc định của Starlight): thanh điều hướng chương bên trái, mục lục bên phải, ô tìm kiếm tích hợp, dark mode, **tự responsive** cho điện thoại. Ngôn ngữ chính: tiếng Việt (`lang: vi`).
- **Hosting**: deploy miễn phí lên **GitHub Pages** hoặc **Netlify**.
- **Quản lý phiên bản**: git ngay từ đầu (phục vụ cả việc deploy tự động).

### Cấu trúc 4 khu (chia ngay từ đầu để mở rộng không phải đập đi xây lại)

| Khu | Nội dung | Trạng thái v1 |
|-----|----------|----------------|
| 📚 1. Lộ trình học A→Z | Curriculum 11 chương | **Làm đầy đủ** |
| 🛠️ 2. Công cụ Build / Theorycraft | Máy tính/planner build | Khung trống + mô tả "sắp có" |
| 💰 3. Dashboard Kiếm tiền | Giá cả, chiến lược farm, ROI | Khung trống + mô tả "sắp có" |
| 🧠 4. Ghi chú cá nhân / Knowledge hub | Ghi chú + liên kết kiến thức | Khung trống + mô tả "sắp có" |

Mỗi khu là một nhóm sidebar riêng trong Starlight. 3 khu sau ở v1 chỉ là 1 trang giới thiệu ngắn ("tính năng đang phát triển") để giữ chỗ kiến trúc.

---

## 3. Lộ trình học A→Z — Cấu trúc 11 chương

Thứ tự có chủ đích: hiểu nhân vật & cơ chế → đi hết game → hiểu đồ & craft → endgame → kiếm tiền → tự build.

- **Chương 0 — Nhập môn**: ARPG là gì; vòng lặp cốt lõi (nhặt đồ → mạnh hơn → giết nhanh hơn); Early Access; League vs Standard; bảng thuật ngữ nền tảng.
- **Chương 1 — Nhân vật: Class & Ascendancy**: 6 class + 3 chỉ số gốc (Str/Dex/Int); Ascendancy là gì; class dễ cho người mới.
- **Chương 2 — Cơ chế cốt lõi**: Skill Gem & Support Gem (khác POE1); Spirit; các loại sát thương & hiệu ứng (cháy/đóng băng/sốc/độc/chảy máu); phòng thủ (giáp/né/khiên năng lượng/kháng/đỡ); máu/mana/flask.
- **Chương 3 — Đi cốt truyện (Campaign)**: **hướng dẫn từng Act, từng bước** (việt hóa đầy đủ); độ khó Cruel; quy tắc sống còn (luôn đủ kháng); mẹo lên cấp; cơ chế boss cơ bản. → Nhấn mạnh "chơi dễ nhất".
- **Chương 4 — Cây kỹ năng bị động (Passive Tree)**: cách đọc cây (notable/keystone/ô ngọc); Path of Building 2 (PoB2); cách cộng dồn sát thương cơ bản.
- **Chương 5 — Trang bị & Vật phẩm**: độ hiếm; affix (tiền tố/hậu tố), item level, base; cách đọc đồ "ngon".
- **Chương 6 — Chế đồ (Crafting)**: từng currency orb làm gì (Transmute/Aug/Alch/Chaos/Exalt/Divine...); Essence/Rune/Omen; công thức craft cơ bản cho người mới.
- **Chương 7 — Endgame: Atlas & Waystones (Maps)**: mở khóa endgame; waystone/map, cây Atlas; cơ chế trong map (Breach/Ritual/Expedition/Delirium...); pinnacle boss.
- **Chương 8 — 💰 Kinh tế & Kiếm tiền**: currency nào đáng giá; trang Trade & cách định giá; các cách farm currency (chạy map/đánh boss/craft bán/đầu tư); tư duy ROI.
- **Chương 9 — 🔨 Tự cook Build & Theorycraft**: quy trình tự thiết kế build; PoB2 mức sâu; đọc meta rồi biến tấu.
- **Chương 10 — Tài nguyên & Cập nhật theo patch**: danh sách nguồn gốc; cách theo dõi thay đổi mỗi patch.

---

## 4. Khuôn một trang bài học

Mỗi bài theo khuôn thống nhất:

1. **Tiêu đề** + một dòng "Bài này bạn sẽ hiểu được: ...".
2. **Nội dung tiếng Việt** — giải thích + ví dụ + (nếu cần) hình minh họa.
3. **📦 Hộp Thuật ngữ Anh–Việt** — mỗi khái niệm việt hóa kèm đúng từ tiếng Anh để người dùng nhận ra trong game. *(Tính năng then chốt cho rào cản ngôn ngữ.)*
4. **🔗 Nguồn gốc** — link bài tiếng Anh chính thống đã dùng.
5. **📊 Số liệu sống** — link poe.ninja / Trade nơi nào liên quan (KHÔNG viết cứng số liệu hay đổi vào bài).
6. **🗓️ Cập nhật lần cuối** — ngày + phiên bản patch.
7. **✅ Điểm mấu chốt** — 3–5 gạch đầu dòng tóm tắt.

Khuôn này nên được hiện thực hóa thành một component/snippet tái dùng (ví dụ MDX component cho Hộp Thuật ngữ, hộp Nguồn, hộp Điểm mấu chốt) để mọi trang đồng nhất.

---

## 5. Chất lượng, độ chính xác & cập nhật theo patch

- **Nguồn chính thống**: trang chủ/patch notes chính thức của POE2, Wiki, poe2db, Maxroll, Path of Building 2, poe.ninja.
- **Quy trình chính xác**: nội dung viết từ kiến thức của Claude **+ đối chiếu nguồn link**; số liệu hay đổi (giá, con số cân bằng) **link ra ngoài**, không hardcode.
- **Tự kiểm tra liên tục**: trong lúc tạo nội dung, liên tục đối chiếu nguồn; chạy build kiểm lỗi; kiểm link hỏng.
- **Theo patch**: mỗi bài có ngày + phiên bản "cập nhật lần cuối"; Chương 10 chuyên theo dõi thay đổi.
- **Lưu ý hiển thị**: trang là tài liệu học tiếng Việt hỗ trợ; luôn có link gốc để đối chiếu. POE2 đang Early Access nên cơ chế có thể đổi.

---

## 6. Kiểm thử & Triển khai

- **Build check**: `astro build` chạy sạch, không lỗi.
- **Link check**: kiểm tra link nội bộ và link ngoài (báo link hỏng).
- **Responsive**: kiểm tra hiển thị trên khổ điện thoại.
- **Deploy**: mặc định **GitHub Pages** (miễn phí, tự động qua GitHub Actions vì đã có git); **Netlify** là phương án dự phòng nếu người dùng chưa có tài khoản GitHub. Xác nhận tài khoản GitHub trong bước dựng khung (Đợt 0).

---

## 7. Kế hoạch triển khai theo đợt (milestones)

Mục tiêu cuối: **đủ 11 chương đầy đủ**. Giao theo đợt để dùng được sớm và giữ chất lượng:

- **Đợt 0 — Khung**: dựng dự án Astro+Starlight, cấu hình tiếng Việt, dựng 4 khu + sidebar 11 chương (mỗi chương có trang khung + link nguồn), tạo các MDX component khuôn bài (Thuật ngữ Anh–Việt / Nguồn / Điểm mấu chốt), deploy lần đầu để có link xem được.
- **Đợt 1 — Nền tân thủ**: viết đầy đủ Chương 0, 1, 2.
- **Đợt 2 — Chơi được game**: viết đầy đủ Chương 3 (campaign từng act), 4, 5.
- **Đợt 3 — Sâu hệ thống**: viết đầy đủ Chương 6, 7.
- **Đợt 4 — Mục tiêu lớn**: viết đầy đủ Chương 8, 9, 10.

Mỗi đợt: viết nội dung → tự đối chiếu nguồn → build + kiểm link → deploy → người dùng xem.

---

## 8. Quyết định đã chốt (tóm tắt)

| Vấn đề | Quyết định |
|--------|------------|
| Ưu tiên | Lộ trình học A→Z trước; build tool, dashboard, hub làm sau |
| Nguồn nội dung | Claude việt hóa từ nguồn Anh ngữ chính thống + link gốc |
| Ngôn ngữ | Tiếng Việt là chính; kèm thuật ngữ tiếng Anh |
| Đối tượng | Tân thủ hoàn toàn |
| Truy cập | Online, responsive (điện thoại + PC), hosting miễn phí |
| Công nghệ | Astro + Starlight |
| Khung chương | 11 chương, giữ nguyên |
| Phạm vi nội dung v1 | Đầy đủ cả 11 chương, giao theo đợt |
| Campaign | Việt hóa từng act, hướng "chơi dễ nhất" |
