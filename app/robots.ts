import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

/** Público indexável; dashboard e APIs fora (fase B). */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/', '/auth/', '/leads'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
