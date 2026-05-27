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
            {
              label: 'Chương 1 — Class & Ascendancy',
              items: [
                { label: 'Tổng quan chương', link: '/lo-trinh/chuong-1-class-ascendancy/' },
                { label: 'Chỉ số gốc (Str/Dex/Int)', link: '/lo-trinh/chuong-1-class-ascendancy/chi-so-goc/' },
                { label: 'Các class', link: '/lo-trinh/chuong-1-class-ascendancy/cac-class/' },
                { label: 'Ascendancy là gì', link: '/lo-trinh/chuong-1-class-ascendancy/ascendancy/' },
                { label: 'Class cho người mới', link: '/lo-trinh/chuong-1-class-ascendancy/class-cho-nguoi-moi/' },
              ],
            },
            {
              label: 'Chương 2 — Cơ chế cốt lõi',
              items: [
                { label: 'Tổng quan chương', link: '/lo-trinh/chuong-2-co-che-cot-loi/' },
                { label: 'Skill Gem & Support Gem', link: '/lo-trinh/chuong-2-co-che-cot-loi/skill-gem-support/' },
                { label: 'Spirit', link: '/lo-trinh/chuong-2-co-che-cot-loi/spirit/' },
                { label: 'Sát thương & hiệu ứng', link: '/lo-trinh/chuong-2-co-che-cot-loi/sat-thuong-va-hieu-ung/' },
                { label: 'Phòng thủ', link: '/lo-trinh/chuong-2-co-che-cot-loi/phong-thu/' },
                { label: 'Máu / Mana / Flask', link: '/lo-trinh/chuong-2-co-che-cot-loi/mau-mana-flask/' },
              ],
            },
            {
              label: 'Chương 3 — Đi cốt truyện',
              items: [
                { label: 'Tổng quan chương', link: '/lo-trinh/chuong-3-campaign/' },
                { label: 'Nguyên tắc sống còn', link: '/lo-trinh/chuong-3-campaign/nguyen-tac-song-con/' },
                { label: 'Act 1', link: '/lo-trinh/chuong-3-campaign/act-1/' },
                { label: 'Act 2', link: '/lo-trinh/chuong-3-campaign/act-2/' },
                { label: 'Act 3', link: '/lo-trinh/chuong-3-campaign/act-3/' },
                { label: 'Act 4', link: '/lo-trinh/chuong-3-campaign/act-4/' },
                { label: 'Độ khó & Cruel', link: '/lo-trinh/chuong-3-campaign/do-kho-cruel/' },
                { label: 'Mẹo lên cấp', link: '/lo-trinh/chuong-3-campaign/meo-len-cap/' },
              ],
            },
            {
              label: 'Chương 4 — Passive Tree',
              items: [
                { label: 'Tổng quan chương', link: '/lo-trinh/chuong-4-passive-tree/' },
                { label: 'Đọc cây passive', link: '/lo-trinh/chuong-4-passive-tree/doc-cay-passive/' },
                { label: 'Path of Building 2', link: '/lo-trinh/chuong-4-passive-tree/path-of-building-2/' },
                { label: 'Cộng dồn sát thương', link: '/lo-trinh/chuong-4-passive-tree/cong-don-sat-thuong/' },
              ],
            },
            {
              label: 'Chương 5 — Trang bị & Vật phẩm',
              items: [
                { label: 'Tổng quan chương', link: '/lo-trinh/chuong-5-trang-bi/' },
                { label: 'Độ hiếm của đồ', link: '/lo-trinh/chuong-5-trang-bi/do-hiem/' },
                { label: 'Affix & Item Level', link: '/lo-trinh/chuong-5-trang-bi/affix-va-ilvl/' },
                { label: 'Đọc một món đồ', link: '/lo-trinh/chuong-5-trang-bi/doc-mot-mon-do/' },
              ],
            },
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
