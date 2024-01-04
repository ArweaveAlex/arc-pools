import { PoolClient, PoolConfigType } from 'arcframework';

import { NEWS_API_PAGINATOR } from '../../helpers/config';
import { gnewsEndpoint } from '../../helpers/endpoints';
import { exitProcess, log, logValue, shuffleArray } from '../../helpers/utils';
import { processArticles } from '../gnews';

export async function run(poolConfig: PoolConfigType) {
  const poolClient = new PoolClient({ poolConfig });
  console.log('test');

  log(`Mining GNews API...`, 0);

  const keywords = shuffleArray(poolConfig.keywords);
    for (const keyword of keywords) {
        let endpoint = gnewsEndpoint(encodeURIComponent(keyword), poolConfig.gnewsApiKey, 1);
        const initialResponse = await fetch(endpoint);

        if (initialResponse.ok) {
            const initialResponseData = await initialResponse.json();
            logValue(`News API Article Count - (${keyword})`, initialResponseData.totalArticles.toString(), 0);
            try {
                await processArticles(poolClient, { articles: initialResponseData.articles });
                if (initialResponseData.totalResults > NEWS_API_PAGINATOR) {
                    for (let i = NEWS_API_PAGINATOR, j = 2; i < initialResponseData.totalResults; i+= NEWS_API_PAGINATOR, j++) {
                        endpoint = gnewsEndpoint(encodeURIComponent(keyword), poolConfig.gnewsApiKey, j);
                        const response = await fetch(endpoint);
                        if (response.ok) {
                            const responseData = await response.json();
                            await processArticles(poolClient, { articles: responseData.articles });
                        }
                    }
                }
            }
            catch (e: any) {
                log(e.message ? e.message : 'Error occurred', 1);
            }
        } else {
            console.error('Failed to fetch:', initialResponse.status, initialResponse.statusText);
            if (initialResponse.status === 429) {
                console.log('News API request limit reached')
                return;
            }
        }
    }
    log(`GNews API Mining Complete`, 0);
}
