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
        // Sidebar đầy đủ được điền ở task sau.
      ],
    }),
  ],
});
