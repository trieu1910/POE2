// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// LƯU Ý: cập nhật `site` và `base` sau khi biết tên repo GitHub (bước deploy).
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
        {
          label: '📚 Lộ trình học A→Z',
          items: [
            {
              label: 'Chương 0 — Nhập môn',
              items: [
                { label: 'Tổng quan chương', link: '/lo-trinh/chuong-0-nhap-mon/' },
                { label: 'ARPG là gì & vòng lặp cốt lõi', link: '/lo-trinh/chuong-0-nhap-mon/arpg-va-vong-lap/' },
                { label: 'Early Access là gì', link: '/lo-trinh/chuong-0-nhap-mon/early-access/' },
                { label: 'League vs Standard', link: '/lo-trinh/chuong-0-nhap-mon/league-vs-standard/' },
                { label: 'Bảng thuật ngữ nền tảng', link: '/lo-trinh/chuong-0-nhap-mon/bang-thuat-ngu/' },
              ],
            },
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
    }),
  ],
});
