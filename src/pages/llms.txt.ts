import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { getProducts } from '../lib/products';
import { getStories } from '../lib/stories';

// The site as one Markdown file (llmstxt.org), so an AI assistant can answer
// "where can I buy Tolima cacao" without crawling every page.
export const GET: APIRoute = async ({ site: origin }) => {
	const [site, footer, products, stories] = await Promise.all([getEntry('site', 'main'), getEntry('footer', 'main'), getProducts(), getStories()]);
	if (!site || !footer) throw new Error('Missing site content for llms.txt');
	const link = (path: string) => new URL(path, origin).href;
	const { brand, contact, location } = footer.data;
	const body = [
		`# ${brand}`,
		'',
		`> ${site.data.description}`,
		'',
		`Cacao para bebidas de ${location.join(', ')}. Los precios, las presentaciones y el envío se consultan por WhatsApp al ${contact.phone.label} (${contact.phone.href}) o al correo ${contact.email}.`,
		'',
		'## Cacaos',
		'',
		...products.map((product) => `- [${product.name}](${link(product.href)}): ${product.intro} (${product.percentage} cacao; ${product.sweetener.toLowerCase()}).`),
		'',
		'## Historias',
		'',
		`- [Nuestra historia](${link('/historia/')})`,
		...stories.map((story) => `- [${story.heading}](${link(story.href)}): ${story.excerpt}`),
		'',
		'## Ayuda',
		'',
		...footer.data.policies.map((page) => `- [${page.label}](${link(page.href)})`),
		'',
	].join('\n');
	return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
