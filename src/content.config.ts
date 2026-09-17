import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const landingSections = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/landing-sections' }),
	schema: z.object({
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
