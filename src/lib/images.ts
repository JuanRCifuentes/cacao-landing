const widths = [480, 800, 1200, 1600, 2200];

/** Unsplash resizes on request, so let the browser pick a copy no wider than it needs. */
export function srcset(src: string) {
	if (!src.startsWith('https://images.unsplash.com/')) return undefined;
	const url = new URL(src);
	const max = Number(url.searchParams.get('w'));
	if (!max) return undefined;
	return [...widths.filter((width) => width < max), max].map((width) => {
		url.searchParams.set('w', String(width));
		return `${url.href} ${width}w`;
	}).join(', ');
}
