import type { APIRoute, GetStaticPaths } from 'astro';
import { getEntry } from 'astro:content';
import { getLandingSection } from '../../lib/content';
import { pageCard, siteCard } from '../../lib/og';
import { getProducts } from '../../lib/products';
import { getStories } from '../../lib/stories';

// One link preview card per page that has its own: the site, each product and each story.
export const getStaticPaths = (async () => {
	const [footer, hero, products, stories] = await Promise.all([
		getEntry('footer', 'main'),
		getLandingSection('hero', 'hero'),
		getProducts(),
		getStories(),
	]);
	if (!footer) throw new Error('Missing footer content for the site card');
	return [
		{ params: { card: 'home' }, props: { draw: () => siteCard({ eyebrow: hero.eyebrow, name: footer.data.brand, tagline: footer.data.tagline, photo: hero.image.src }) } },
		...products.map((product) => ({
			params: { card: `productos/${product.slug}` },
			props: {
				draw: () =>
					pageCard({
						eyebrow: product.eyebrow,
						title: `${product.percentage} cacao`,
						subtitle: product.variety,
						label: `Cacao de autor  /  ${String(product.order).padStart(2, '0')}`,
						footer: 'Consulta y pide por WhatsApp',
						photo: product.image.src,
					}),
			},
		})),
		...stories.map((story) => ({
			params: { card: `historias/${story.slug}` },
			props: { draw: () => pageCard({ eyebrow: story.category, title: story.heading, footer: 'Lee la historia', photo: story.image.src }) },
		})),
	];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
	new Response(await props.draw(), { headers: { 'Content-Type': 'image/jpeg' } });
