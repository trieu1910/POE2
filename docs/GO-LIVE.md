# Đưa web lên mạng (GO-LIVE) — 3 bước, ~5 phút

Web đã build sạch ở máy. Để có link xem trên điện thoại + PC (miễn phí, qua GitHub Pages), cần các bước sau. Phần này cần **tài khoản GitHub của bạn** nên để bạn tự làm (hoặc nhờ Claude làm cùng khi bạn online và cấp thông tin).

## Bước 1 — Tạo tài khoản & repo GitHub
1. Có tài khoản tại https://github.com (miễn phí). Ghi nhớ **username**.
2. Tạo 1 repository trống, gợi ý tên: `poe2-master` (để Public để Pages miễn phí).

## Bước 2 — Điền `site` + `base` trong `astro.config.mjs`
Mở `astro.config.mjs`, trong `defineConfig({ ... })` (cùng cấp với `integrations`) thêm 2 dòng, thay `<user>` = username và `<repo>` = tên repo:
```js
  site: 'https://<user>.github.io',
  base: '/<repo>',
```
Ví dụ user `abc`, repo `poe2-master` → `site: 'https://abc.github.io'`, `base: '/poe2-master'`.

## Bước 3 — Bật Pages & đẩy code
Trên GitHub: repo → **Settings → Pages → Source = GitHub Actions**.
Rồi ở máy (PowerShell, trong thư mục dự án):
```
git checkout main
git merge feat/poe2-site-v1   # nếu chưa gộp nhánh
git remote add origin https://github.com/<user>/<repo>.git
git branch -M main
git push -u origin main
```
Workflow `.github/workflows/deploy.yml` (đã có sẵn) sẽ tự build & deploy. Sau ~1–2 phút, web lên tại:
`https://<user>.github.io/<repo>/`

## Lưu ý
- Mỗi lần sau này `git push` lên `main`, web tự cập nhật.
- Nếu link nội bộ 404 sau khi lên Pages: kiểm tra `base` đã đúng tên repo chưa.
- Phương án thay thế (không cần GitHub): kéo-thả thư mục `dist/` (tạo bằng `npm run build`) lên https://app.netlify.com/drop.
