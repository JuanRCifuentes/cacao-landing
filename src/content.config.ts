import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const landingSections = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/landing-sections' }),
	schema: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('hero'),
			eyebrow: z.string(),
			heading: z.array(z.string()).length(2),
			cta: z.object({ label: z.string(), href: z.string() }),
			scrollLabel: z.string(),
			scrollHref: z.string(),
			contactLabel: z.string(),
			navigation: z.array(z.object({ label: z.string(), href: z.string() })),
			image: z.object({
				src: z.string(),
				smallSrc: z.string(),
				alt: z.string(),
				width: z.number().positive(),
				height: z.number().positive(),
			}),
		}),
		z.object({
			type: z.literal('heritage'),
			eyebrow: z.string(),
			heading: z.string(),
			description: z.string(),
			cta: z.object({
				label: z.string(),
				href: z.string(),
			}),
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
			cta: z.object({ label: z.string(), href: z.string() }),
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
		navigation: z.array(z.object({ label: z.string(), href: z.string() })),
		policies: z.array(z.object({ label: z.string(), href: z.string() })),
		newsletter: z.object({ label: z.string(), href: z.string() }),
		socials: z.array(z.object({ label: z.string(), href: z.string() })),
		contact: z.object({ label: z.string(), email: z.string().email() }),
		trade: z.object({ label: z.string(), email: z.string().email() }),
		location: z.array(z.string()),
		copyright: z.string(),
	}),
});

export const collections = { landingSections, footer };
