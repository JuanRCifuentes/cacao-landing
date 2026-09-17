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
			scrollLabel: z.string(),
			scrollHref: z.string(),
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
				cta: link,
			})).min(1),
		}),
		z.object({
			type: z.literal('heritage'),
			eyebrow: z.string(),
			heading: z.string(),
			description: z.string(),
			cta: link,
			images: z.object({
				team: z.url(),
				coffee: z.url(),
				roastery: z.url(),
				beans: z.url(),
				barista: z.url(),
				harvest: z.url(),
				cup: z.url(),
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
		navigation: z.array(link),
		policies: z.array(link),
		newsletter: link,
		socials: z.array(link),
		contact: z.object({ label: z.string(), email: z.email() }),
		trade: z.object({ label: z.string(), email: z.email() }),
		location: z.array(z.string()),
		copyright: z.string(),
	}),
});

export const collections = { site, landingSections, footer };
