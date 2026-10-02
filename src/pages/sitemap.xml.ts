import type { APIRoute } from 'astro';
import { getProducts } from '../lib/products';

export const GET: APIRoute = async ({ site }) => {
	const base = site ?? new URL('https://origentolima.com');
	const paths = ['/', ...(await getProducts()).map((product) => product.href)];
	const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	const urls = paths.map((path) => `<url><loc>${escapeXml(new URL(path, base).href)}</loc></url>`).join('');
	return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
