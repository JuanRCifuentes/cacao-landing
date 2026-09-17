import { getEntry, type CollectionEntry } from 'astro:content';

type LandingSection = CollectionEntry<'landingSections'>['data'];

/** Read and narrow section content at build time; nothing is shipped to the browser. */
export async function getLandingSection<Type extends LandingSection['type']>(
	id: string,
	type: Type,
): Promise<Extract<LandingSection, { type: Type }>> {
	const entry = await getEntry('landingSections', id);
	if (!entry || entry.data.type !== type) {
		throw new Error(`Expected landing section "${id}" with type "${type}".`);
	}

	return entry.data as Extract<LandingSection, { type: Type }>;
}
