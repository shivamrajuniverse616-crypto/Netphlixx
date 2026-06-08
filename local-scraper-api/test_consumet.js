const { MOVIES } = require("@consumet/extensions");

(async () => {
    try {
        const flixhq = new MOVIES.FlixHQ();
        console.log("Searching for The Boys (76479)...");
        const res = await flixhq.search("The Boys");
        if (res.results.length === 0) {
            console.log("No results found.");
            return;
        }
        
        const id = res.results[0].id;
        console.log("Found ID:", id);
        
        console.log("Fetching media info...");
        const info = await flixhq.fetchMediaInfo(id);
        
        const epId = info.episodes[0].id;
        console.log("Fetching episode stream for ID:", epId);
        
        const stream = await flixhq.fetchEpisodeSources(epId, id);
        console.log("Stream:", JSON.stringify(stream, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
})();
