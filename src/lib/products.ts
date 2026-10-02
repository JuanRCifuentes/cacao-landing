import { getCollection } from 'astro:content';
import { getLandingSection } from './content';

export const productPath = (slug: string) => `/productos/${slug}/`;

/** Join editorial detail with the existing product photography and order messages. */
export async function getProducts() {
	const [entries, landing] = await Promise.all([
		getCollection('products'),
		getLandingSection('products', 'products'),
	]);
	return entries.map(({ data }) => {
		const card = landing.products.find((product) => product.id === data.landingId);
		if (!card) throw new Error(`Missing landing product: ${data.landingId}`);
		return { ...data, image: card.image, orderMessage: card.cta.message, href: productPath(data.slug) };
	}).sort((a, b) => a.order - b.order);
}

export type Product = Awaited<ReturnType<typeof getProducts>>[number];
