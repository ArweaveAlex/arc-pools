export type ValidatedMinerType = { source: string; status: boolean; message: string };

export type NewsApiArticleType = {
    source: {
        id: string,
        name: string
    },
    author: string,
    title: string,
    description: string,
    url: string,
    urlToImage: string,
    publishedAt: string,
    content: string
}
