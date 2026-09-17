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

export const collections = { landingSections };
