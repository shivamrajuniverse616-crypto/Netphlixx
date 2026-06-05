const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
app.use(cors());

const flixhq = new MOVIES.FlixHQ();

app.get('/api/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { title, s, e } = req.query; // Need title to search FlixHQ
  
  try {
    // 1. Search FlixHQ for the title
    const searchRes = await flixhq.search(title);
    if (!searchRes.results || searchRes.results.length === 0) {
      return res.status(404).json({ error: "Title not found on FlixHQ" });
    }
    
    // 2. Get the media info for the first result
    const mediaId = searchRes.results[0].id;
    const mediaInfo = await flixhq.fetchMediaInfo(mediaId);
    
    let episodeId;
    if (type === 'tv') {
      const episode = mediaInfo.episodes.find(ep => ep.season === parseInt(s) && ep.number === parseInt(e));
      if (!episode) return res.status(404).json({ error: "Episode not found" });
      episodeId = episode.id;
    } else {
      episodeId = mediaInfo.episodes[0].id; // For movies, usually there's just one 'episode' representing the movie
    }
    
    // 3. Fetch sources
    const sources = await flixhq.fetchEpisodeSources(episodeId, mediaId);
    return res.json(sources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Scraper server running on port ${PORT}`));
