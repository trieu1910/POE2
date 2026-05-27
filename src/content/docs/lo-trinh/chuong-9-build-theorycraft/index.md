---
title: Chương 9 — Tự cook Build & Theorycraft
description: Học cách tự thiết kế build Path of Exile 2 từ đầu — một quy trình lặp được, dùng PoB2 để kiểm chứng, và cách đọc build meta rồi biến tấu thành của riêng bạn thay vì copy mù.
lastUpdated: 2026-05-27
---

Tới đây bạn đã biết class, cơ chế cốt lõi, cây passive, trang bị, crafting và kinh tế. Chương này gom tất cả lại để trả lời một câu hỏi vui nhất trong Path of Exile 2 (POE2): **"Tự mình nghĩ ra một build thì làm thế nào?"** — hay nói kiểu dân chơi, **"tự cook build"**.

> ⚠️ POE2 đang **Early Access** (vẫn phải mua để chơi), bản hiện hành khi viết là **0.5.x**. Cơ chế, con số và **đặc biệt là meta build thay đổi theo từng patch/league**. Chương này cố tình dạy **cách tư duy** (mental model) thay vì bắt bạn học thuộc một build cụ thể — vì build hôm nay mạnh, patch sau có thể bị nerf. Học quy trình, đừng học thuộc một con cá.

## Chương này khác gì các chương trước

Các chương trước dạy **dữ kiện** (class này làm gì, currency nào giá trị). Chương này dạy **quy trình** — cách ghép các dữ kiện đó thành một nhân vật chơi được. Đây là chương thiên về **tư duy và cách làm việc**, ít con số phải nhớ.

Mục tiêu không phải biến bạn thành theorycrafter (người tính toán build chuyên sâu) ngay lập tức, mà cho bạn **một cách làm lặp lại được**: nghĩ ý tưởng → kiểm chứng → sửa → chơi.

## Mục lục chương

Đọc theo thứ tự này là hợp lý nhất:

- **[Quy trình thiết kế build](/lo-trinh/chuong-9-build-theorycraft/quy-trinh-thiet-ke-build/)** — Một quy trình 7 bước lặp được để dựng build từ con số 0: chọn skill chính + cách nó gây sát thương, chọn lớp phòng thủ, chọn support, tìm đường đi cây passive + ascendancy, đặt ưu tiên trang bị, kiểm trong PoB2, rồi lặp lại. Tư tưởng xuyên suốt: **sống trước, sát thương sau**.
- **[PoB2 nâng cao](/lo-trinh/chuong-9-build-theorycraft/pob2-nang-cao/)** — Dùng Path of Building 2 sâu hơn để **kiểm chứng** một build: so sánh hai cây passive, thử đổi gem/support, đọc số DPS và EHP/phòng thủ, nhập mã build của người khác để học, và soi lỗ hổng kháng. (Nối tiếp bài PoB2 cơ bản ở Chương 4.)
- **[Đọc meta & biến tấu](/lo-trinh/chuong-9-build-theorycraft/doc-meta-va-bien-tau/)** — Cách đọc build "meta" (từ poe.ninja và guide Maxroll) và **chỉnh cho hợp túi tiền + hoàn cảnh của bạn** thay vì copy mù: hiểu **vì sao** một build mạnh, phân biệt món đồ "carry" đắt tiền với phần lõi rẻ, và cách thay thế. Đây là trang "học từ meta, rồi biến thành của mình".

## Học xong chương này bạn sẽ

- Có **một quy trình rõ ràng** để tự nghĩ ra build, không phải dò dẫm.
- Biết **đặt phòng thủ lên trước** rồi mới đẩy sát thương — sai lầm chí mạng của người mới là làm ngược lại.
- Dùng **PoB2 như phòng thí nghiệm**: thử mọi thứ ngoài game trước khi tiêu currency thật.
- Biết **đọc một build meta cho hiểu**, tách phần đắt với phần rẻ, và **biến tấu thành build của riêng bạn** với ngân sách thật.
