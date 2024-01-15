export type ValidatedMinerType = { source: string; status: boolean; run: any };

export type NewsArticleType = {
	source: {
		id: string;
		name: string;
	};
	author: string;
	title: string;
	description: string;
	url: string;
	urlToImage: string;
	publishedAt: string;
	content: string;
};

export type GNewsArticleType = {
	title: string;
	description: string;
	content: string;
	image: string;
	url: string;
	publishedAt: string;
	source: {
		name: string;
		url: string;
	};
};
