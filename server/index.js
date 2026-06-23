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

app.get('/api/livetv', async (req, res) => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/FunctionError/PiratesTv/main/combined_playlist.m3u');
    if (!response.ok) throw new Error('Failed to fetch M3U playlist');
    const text = await response.text();
    
    const channels = [];
    const lines = text.split('\n');
    let currentChannel = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        currentChannel = {};
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        const groupMatch = line.match(/group-title="([^"]*)"/);
        const nameMatch = line.split(',');
        
        currentChannel.logo = logoMatch ? logoMatch[1] : '';
        currentChannel.group = groupMatch ? groupMatch[1] : 'Uncategorized';
        // Cleanup empty groups
        if (!currentChannel.group || currentChannel.group === "") currentChannel.group = 'Uncategorized';
        
        currentChannel.name = nameMatch.length > 1 ? nameMatch.slice(1).join(',').trim() : 'Unknown Channel';
      } else if (line.startsWith('http')) {
        currentChannel.url = line;
        // Generate a unique ID to use as a key
        const uniqueString = (currentChannel.name || '') + currentChannel.url;
        currentChannel.id = Buffer.from(uniqueString).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
        channels.push(currentChannel);
        currentChannel = {};
      }
    }
    
    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Scraper server running on port ${PORT}`));
