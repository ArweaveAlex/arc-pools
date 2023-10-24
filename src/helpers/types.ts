export type ValidatedMinerType = { source: string; status: boolean; run: any };

export type NewsArticleType = {
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
