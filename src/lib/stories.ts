import { getLandingSection } from './content';

const storyContent = [
	{
		slug: 'en-el-corazon-de-nuestra-cordillera',
		sections: [
			{ heading: 'Un lugar que da sentido al cacao', paragraphs: ['En San Sebastián de Mariquita, Tolima, nace Origen Tolima. Nuestro cacao lleva en su nombre el vínculo con esa tierra y con una tradición que se expresa en cada grano.', 'Hablar de nuestro origen es hablar de cuidado paciente. La tierra, el agua y los bosques nativos acompañan una historia que compartimos a través del cacao.'] },
			{ heading: 'De la tierra a una pausa', paragraphs: ['El respeto por la naturaleza y la suavidad de un proceso artesanal dan forma a nuestro cacao. Detrás de cada taza hay manos que cuidan y saberes que perduran.', 'Una taza es una manera de acercarse a ese origen: un momento para disfrutar el carácter del cacao y hacer una pausa.'] },
		],
	},
	{
		slug: 'un-legado-que-se-comparte-en-cada-taza',
		sections: [
			{ heading: 'La paciencia se siente en cada detalle', paragraphs: ['Nuestro cacao nace de un cuidado paciente y de una tradición que honra la tierra. La suavidad de un proceso artesanal transforma el cacao y conserva el carácter de esa tradición.', 'Detrás de cada taza hay manos que cuidan y saberes que perduran. Ese es el legado que compartimos a través del cacao.'] },
			{ heading: 'Un ritual para compartir', paragraphs: ['El chocolate es una invitación a la pausa y al encuentro. Preparar una taza abre un espacio para disfrutar el cacao a tu manera, en un momento propio o en compañía.', 'Nuestra colección reúne cacao puro 100%, cacao 75% con panela orgánica y cacao 75% con stevia. Distintas formas de acercarse a un mismo origen.'] },
		],
	},
	{
		slug: 'cuidar-el-origen',
		sections: [
			{ heading: 'Todo comienza en la tierra', paragraphs: ['Cuidar el cacao es también cuidar el agua y los bosques nativos que acompañan su origen. En San Sebastián de Mariquita, Tolima, nuestro vínculo con la tierra forma parte de la historia de cada grano.', 'La tradición que compartimos honra la naturaleza. Reconocer el agua y los bosques como parte esencial del origen es una manera de contar lo que da sentido a nuestro cacao.'] },
			{ heading: 'Una historia que continúa en cada taza', paragraphs: ['El respeto por la naturaleza y el cuidado paciente se encuentran con un proceso artesanal. Tierra, manos y saberes forman parte del recorrido que compartimos a través del cacao.', 'Cada taza invita a recordar ese origen y a disfrutar un momento de pausa.'] },
		],
	},
];
const storyContentByHref = new Map(storyContent.map((story) => [`/historias/${story.slug}/`, story]));

/** Article metadata comes from the landing cards so both entry points stay in sync. */
export async function getStories() {
	const news = await getLandingSection('partnerships-news', 'partnershipsNews');
	const seenHrefs = new Set<string>();
	const stories = news.articles.map((article) => {
		const content = storyContentByHref.get(article.href);
		if (!content) throw new Error(`Missing story content for landing article "${article.href}".`);
		if (seenHrefs.has(article.href)) throw new Error(`Duplicate landing article "${article.href}".`);
		seenHrefs.add(article.href);
		const [day, month, year] = article.date.split('.');
		return { ...article, ...content, dateIso: `20${year}-${month}-${day}`, image: { ...article.image, width: 1200, height: 900 } };
	});
	for (const href of storyContentByHref.keys()) {
		if (!seenHrefs.has(href)) throw new Error(`Missing landing article for story "${href}".`);
	}
	return stories;
}
