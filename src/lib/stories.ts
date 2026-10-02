import { getCollection, getEntries, type CollectionEntry } from 'astro:content';
import { getLandingSection } from './content';

function toStory(entry: CollectionEntry<'articles'>) {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
		throw new Error(`Article "${entry.id}" must use a lowercase, hyphenated slug.`);
	}
	const html = entry.rendered?.html ?? '';
	if (!entry.body?.trim() || !html.replace(/<!--[\s\S]*?-->/g, '').trim()) {
		throw new Error(`Published article "${entry.id}" must have a Markdown body.`);
	}
	if (/<h1(?:\s|>)/i.test(html)) {
		throw new Error(`Article "${entry.id}" must start its body headings at level two; its title already provides the page h1.`);
	}
	const { title, description, publishedDate, modifiedDate, category, image, seo } = entry.data;
	const [year, month, day] = publishedDate.split('-');
	return {
		slug: entry.id,
		href: `/historias/${entry.id}/`,
		heading: title,
		excerpt: description,
		date: `${day}.${month}.${year.slice(-2)}`,
		dateIso: publishedDate,
		modifiedTime: modifiedDate,
		category,
		image,
		seoTitle: seo?.title ?? `${title} — Origen Tolima`,
		seoDescription: seo?.description ?? description,
		entry,
	};
}

/** All published Markdown articles, newest first, independent of homepage features. */
export async function getStories() {
	const entries = await getCollection('articles', ({ data }) => !data.draft);
	return entries
		.sort((a, b) => b.data.publishedDate.localeCompare(a.data.publishedDate) || a.id.localeCompare(b.id))
		.map(toStory);
}

/** Homepage references control feature order; draft entries never appear publicly. */
export async function getFeaturedStories() {
	const news = await getLandingSection('partnerships-news', 'partnershipsNews');
	const seenIds = new Set<string>();
	for (const reference of news.articles) {
		if (seenIds.has(reference.id)) throw new Error(`Duplicate featured article "${reference.id}".`);
		seenIds.add(reference.id);
	}
	const entries = await getEntries(news.articles);
	return entries.flatMap((entry, index) => {
		if (!entry) throw new Error(`Missing featured article "${news.articles[index].id}".`);
		return entry.data.draft ? [] : [toStory(entry)];
	});
}
