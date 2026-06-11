import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iorganiza.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/icobra`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/imaleta`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/catalogo`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/termos`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Páginas de venda por SaaS (anon key, somente leitura pública)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('saas')
      .select('slug, updated_at')
      .eq('status', 'active')
      .is('deleted_at', null);
    const saasRoutes: MetadataRoute.Sitemap = (data ?? []).map((s) => ({
      url: `${siteUrl}/saas/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    return [...staticRoutes, ...saasRoutes];
  } catch {
    return staticRoutes;
  }
}
