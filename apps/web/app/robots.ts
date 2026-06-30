import { baseUrl } from '@/app/shared/values';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/admin',
        '/manager',
        '/member',
        '/instruments',
        '/files',
        '/*?*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
