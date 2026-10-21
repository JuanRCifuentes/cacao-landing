// Link preview cards (Open Graph images), drawn at build time with satori and
// saved as JPEG by sharp, in the site's espresso, cream and Abril Fatface look.
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import markSvg from '../../public/cocoa-mark.svg?raw';
import patternSvg from '../../public/packaging-pattern.svg?raw';

export const CARD = { width: 1200, height: 630 } as const;

const INK = '#16100b';
const CREAM = '#ead6ae';
const PAPER = '#f4f0e8';
const TAN = '#c6ab86';
const HERO = 'public/images/hero-cacao.webp';

/** A page's card, in the shape SEOHead takes for its image. */
export const cardImage = (slug: string, alt: string) => ({ src: `/og/${slug}.jpg`, alt, ...CARD, type: 'image/jpeg' });

type Node = Parameters<typeof satori>[0];

let fonts: ReturnType<typeof loadFonts> | undefined;
const loadFonts = () =>
	Promise.all(
		[
			{ name: 'Abril Fatface', file: 'abril-fatface-latin-400-normal', weight: 400, style: 'normal' },
			{ name: 'Gelasio', file: 'gelasio-latin-400-italic', weight: 400, style: 'italic' },
			{ name: 'Source Sans 3', file: 'source-sans-3-latin-600-normal', weight: 600, style: 'normal' },
		].map(async ({ file, ...font }) => ({ ...font, data: await readFile(`src/assets/fonts/${file}.woff`) })),
	) as Promise<Parameters<typeof satori>[1]['fonts']>;

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const mark = (color: string, width: number) =>
	img(svgUri(markSvg.replaceAll('currentColor', color)), { width, height: (width * 290) / 280 });

/** A strip of the packaging pattern, as drawn along the site header. */
const patternBand = async (height: number, color: string) => {
	const tile = 160;
	const scale = tile / 480;
	const motifs = patternSvg.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '').replaceAll('stroke="#000"', `stroke="${color}"`);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${height}"><defs><pattern id="tile" width="${tile}" height="${tile / 2}" y="${(height - tile / 2) / 2}" patternUnits="userSpaceOnUse"><g transform="scale(${scale})" fill="none">${motifs}</g></pattern></defs><rect width="100%" height="100%" fill="url(#tile)"/></svg>`;
	const png = await sharp(Buffer.from(svg)).png().toBuffer();
	return img(`data:image/png;base64,${png.toString('base64')}`, { width: CARD.width, height });
};

const photoUri = async (input: Buffer | string, width: number, height: number) => {
	const jpeg = await sharp(input).resize(width, height, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer();
	return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
};

const fetchPhoto = async (src: string) => {
	if (src.startsWith('/')) return `public${src}`;
	try {
		const response = await fetch(src);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return Buffer.from(await response.arrayBuffer());
	} catch (error) {
		console.warn(`[og] ${src} could not be fetched (${error}); using the hero photo.`);
		return HERO;
	}
};

const box = (style: Record<string, unknown>, ...children: unknown[]): Node => ({
	type: 'div',
	props: { style: { display: 'flex', ...style }, children },
});
const img = (src: string, style: Record<string, unknown>): Node => ({ type: 'img', props: { src, style } });
const caps = (fontSize: number, color: string) => ({
	fontFamily: 'Source Sans 3',
	fontSize,
	fontWeight: 600,
	letterSpacing: fontSize / 4,
	color,
	textTransform: 'uppercase',
});
const display = (fontSize: number) => ({ fontFamily: 'Abril Fatface', fontSize, lineHeight: 1.05, letterSpacing: -fontSize / 45, color: CREAM });
const italic = (fontSize: number, color = PAPER) => ({ fontFamily: 'Gelasio', fontStyle: 'italic', fontSize, color });

const render = async (node: Node) => {
	const svg = await satori(node, { ...CARD, fonts: await (fonts ??= loadFonts()) });
	return sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
};

export interface SiteCardText {
	eyebrow: string;
	name: string;
	tagline: string;
}

/** The site's card: the landing hero, darkened, under the brand name. */
export const siteCard = async ({ eyebrow, name, tagline }: SiteCardText) =>
	render(
		box(
			{ ...CARD, position: 'relative', background: INK },
			img(await photoUri(HERO, CARD.width, CARD.height), { position: 'absolute', ...CARD }),
			box({ position: 'absolute', inset: 0, background: 'rgba(22, 16, 11, 0.58)' }),
			box(
				{ position: 'absolute', inset: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
				mark(CREAM, 74),
				box({ ...caps(20, TAN), marginTop: 30 }, eyebrow),
				box({ ...display(132), marginTop: 6 }, name),
				box({ ...italic(38), marginTop: 8 }, tagline),
			),
			box({ position: 'absolute', left: 0, bottom: 0 }, await patternBand(30, TAN)),
		),
	);

export interface PageCardText {
	eyebrow: string;
	title: string;
	/** Italic line under the title, like the product variety. */
	subtitle?: string;
	/** Tag over the photo, like the product page's "Cacao de autor / 01". */
	label?: string;
	/** Closing line at the foot of the panel. */
	footer: string;
	/** Photo path or URL; the hero photo stands in if it can't be fetched. */
	photo: string;
}

/** A product's or story's card: its photo beside the espresso panel, like the product page. */
export const pageCard = async ({ eyebrow, title, subtitle, label, footer, photo }: PageCardText) =>
	render(
		box(
			{ ...CARD, background: INK },
			box(
				{ position: 'relative', width: CARD.height, height: CARD.height },
				img(await photoUri(await fetchPhoto(photo), CARD.height, CARD.height), { width: CARD.height, height: CARD.height }),
				label
					? box({ ...caps(16, CREAM), position: 'absolute', top: 36, left: 36, padding: '10px 16px', border: '1px solid rgba(234, 214, 174, 0.5)', background: 'rgba(22, 16, 11, 0.35)' }, label)
					: null,
			),
			box(
				{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', padding: '60px 56px' },
				box(caps(18, TAN), eyebrow),
				box(
					{ flexDirection: 'column' },
					box(display(title.length > 28 ? 52 : 80), title),
					subtitle ? box({ ...italic(60, CREAM), marginTop: 4 }, subtitle) : null,
				),
				box({ ...caps(17, INK), background: CREAM, padding: '18px 24px' }, footer),
			),
		),
	);
