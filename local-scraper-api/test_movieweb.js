const { makeProviders, makeStandardFetcher, targets } = require('@movie-web/providers');
const fetch = require('cross-fetch');

(async () => {
    try {
        const fetcher = makeStandardFetcher(fetch);
        
        const providers = makeProviders({
            fetcher,
            target: targets.ANY
        });

        console.log("Searching for The Boys (TMDB ID: 76479)...");
        
        const media = {
            type: 'show',
            title: 'The Boys',
            releaseYear: 2019,
            tmdbId: '76479',
            season: {
                number: 1,
                tmdbId: '85271'
            },
            episode: {
                number: 1,
                tmdbId: '1692295'
            }
        };

        const result = await providers.runAll({
            media,
            sourceOrder: ['showbox', 'flixhq', 'vidsrc', 'superstream', 'goplay'] // Specify preferred order
        });

        if (result) {
            console.log("Success! Found stream from:", result.sourceId);
            console.log(JSON.stringify(result.stream, null, 2));
        } else {
            console.log("No stream found across any providers.");
        }
        
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
