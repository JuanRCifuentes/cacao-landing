import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.string() });

const site = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/site' }),
	schema: z.object({
		language: z.string().min(2),
		title: z.string().min(1),
		description: z.string().min(1),
		social: z.object({
			siteName: z.string().min(1),
			locale: z.string().min(2),
			image: z.object({
				src: z.url(),
				alt: z.string().min(1),
				width: z.number().positive(),
				height: z.number().positive(),
				type: z.string().min(1),
			}),
		}),
		menu: z.object({
			openLabel: z.string(),
			closeLabel: z.string(),
			dialogLabel: z.string(),
			navigationLabel: z.string(),
			homeLabel: z.string(),
		}),
	}),
});

const landingSections = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/landing-sections' }),
	schema: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('hero'),
			eyebrow: z.string(),
			cta: link,
			contactLabel: z.string(),
			navigation: z.array(link),
			image: z.object({
				src: z.string(),
				smallSrc: z.string(),
				alt: z.string(),
				width: z.number().positive(),
				height: z.number().positive(),
			}),
		}),
		z.object({
			type: z.literal('products'),
			eyebrow: z.string(),
			heading: z.string(),
			description: z.string(),
			products: z.array(z.object({
				id: z.string(),
				name: z.string(),
				subtitle: z.string(),
				description: z.string(),
				image: z.object({
					src: z.string(),
					alt: z.string(),
					width: z.number().positive(),
					height: z.number().positive(),
				}),
				cta: z.object({
					label: z.string().min(1),
					message: z.string().min(1),
				}),
			})).min(1),
		}),
		z.object({
			type: z.literal('heritage'),
			eyebrow: z.string(),
			heading: z.string(),
			description: z.string(),
			cta: link,
			images: z.object({
				grower: z.url(),
				pods: z.url(),
				drying: z.url(),
				beans: z.url(),
				cacaoTree: z.url(),
				harvest: z.url(),
				chocolate: z.url(),
			}),
		}),
		z.object({
			type: z.literal('purePassion'),
			eyebrow: z.string(),
			heading: z.string(),
			description: z.string(),
			images: z.array(
				z.object({
					src: z.url(),
					alt: z.string(),
					caption: z.string(),
				}),
			).length(3),
		}),
		z.object({
			type: z.literal('video'),
			heading: z.array(z.string()).length(2),
			description: z.string(),
			video: z.object({
				src: z.url(),
				poster: z.url(),
				label: z.string(),
			}),
		}),
		z.object({
			type: z.literal('partnershipsNews'),
			heading: z.string(),
			cta: link,
			articles: z.array(
				z.object({
					date: z.string(),
					category: z.string(),
					heading: z.string(),
					excerpt: z.string(),
					href: z.string(),
					image: z.object({ src: z.url(), alt: z.string() }),
				}),
			).length(3),
		}),
		z.object({
			type: z.literal('newsletter'),
			heading: z.string(),
			description: z.string(),
			background: z.object({ src: z.url(), alt: z.string() }),
			fields: z.object({
				firstName: z.string(),
				lastName: z.string(),
				email: z.string(),
			}),
			submitLabel: z.string(),
		}),
	]),
});

const footer = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/footer' }),
	schema: z.object({
		brand: z.string(),
		tagline: z.string(),
		labels: z.object({
			backToTop: z.string(),
			navigation: z.string(),
			socialMedia: z.string(),
		}),
		navigation: z.array(link),
		policies: z.array(link),
		newsletter: link,
		socials: z.array(link),
		contact: z.object({ label: z.string(), email: z.email(), phone: link }),
		trade: z.object({ label: z.string(), email: z.email() }),
		location: z.array(z.string()),
		copyright: z.string(),
	}),
});

const products = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/products' }),
	schema: z.object({
		landingId: z.string().min(1),
		slug: z.string().regex(/^[a-z0-9-]+$/),
		order: z.number().int().positive(),
		name: z.string().min(1),
		title: z.string().min(1),
		metaDescription: z.string().min(1),
		percentage: z.string().min(1),
		variety: z.string().min(1),
		eyebrow: z.string().min(1),
		intro: z.string().min(1),
		profile: z.string().min(1),
		sweetener: z.string().min(1),
		story: z.object({ heading: z.string(), description: z.string() }),
		notes: z.array(z.object({ heading: z.string(), description: z.string() })).length(3),
		preparation: z.array(z.object({ heading: z.string(), description: z.string() })).length(3),
		faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(3),
	}),
});

export const collections = { site, landingSections, footer, products };
