import type { APIRoute } from 'astro';
import { getProducts } from '../lib/products';
import { getStories } from '../lib/stories';

export const GET: APIRoute = async ({ site }) => {
	const base = site ?? new URL('https://origentolima.com');
	const paths = ['/', '/historia/', '/historias/', '/privacidad/', '/terminos-y-condiciones/', '/envios-y-devoluciones/', ...(await getProducts()).map((product) => product.href)];
	const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	const entries = [...paths.map((path) => ({ path, lastmod: undefined as string | undefined })), ...(await getStories()).map((story) => ({ path: story.href, lastmod: story.modifiedTime ?? story.dateIso }))];
	const urls = entries.map(({ path, lastmod }) => `<url><loc>${escapeXml(new URL(path, base).href)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}</url>`).join('');
	return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
