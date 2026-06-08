import express from 'express';
import cors from 'cors';
import { getVaPlayerStream, getVidLinkStream } from './scraper.js';
import tmdbScrape from './vidsrc.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// A proxy route, similar to Vercel's proxy.ts, but simple for localhost
app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl || typeof targetUrl !== 'string') {
        return res.status(400).send('Missing url parameter');
    }

    const isVidLink = targetUrl.includes('vidlink') || targetUrl.includes('vodvidl') || targetUrl.includes('typhoontigertribe');
    const isVidSrc = targetUrl.includes('vidsrc') || targetUrl.includes('whisperingauroras');
    
    let reqReferer = 'https://vaplayer.ru/';
    let reqOrigin = 'https://vaplayer.ru';
    
    if (isVidLink) {
        reqReferer = 'https://vidlink.pro/';
        reqOrigin = 'https://vidlink.pro';
    } else if (isVidSrc) {
        reqReferer = 'https://whisperingauroras.com/';
        reqOrigin = 'https://whisperingauroras.com';
    }
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36';

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': UA,
                'Referer': reqReferer,
                'Origin': reqOrigin,
                'Accept': '*/*'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).send(response.statusText);
        }

        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        let body = buffer.toString('utf8');
        if (targetUrl.endsWith('.m3u8')) {
            const baseUrl = new URL(targetUrl);
            baseUrl.pathname = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
            
            body = body.replace(/^(?!#)(?!http)(.+)$/gm, (match) => {
                if (match.trim() === '') return match;
                const absoluteUrl = new URL(match, baseUrl.toString()).toString();
                return `http://localhost:${port}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            });
            res.send(body);
        } else {
            res.send(buffer);
        }
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).send("Proxy error");
    }
});

// The main streaming endpoint
app.get('/api', async (req, res) => {
    const { imdb, tmdb, s, e } = req.query;

    if (!imdb && !tmdb) {
        return res.status(400).json({ error: 'Missing imdb or tmdb parameter' });
    }

    const id = (tmdb as string) || (imdb as string);
    const idType = tmdb ? 'tmdb' : 'imdb';
    const sStr = typeof s === 'string' ? s : undefined;
    const eStr = typeof e === 'string' ? e : undefined;

    try {
        const [vaPlayerResult, vidLinkResult, vidsrcResult] = await Promise.allSettled([
            getVaPlayerStream(id, idType, sStr, eStr),
            getVidLinkStream(id, idType, sStr, eStr),
            (idType === 'tmdb' ? tmdbScrape(id, sStr ? 'tv' : 'movie', sStr ? parseInt(sStr) : undefined, eStr ? parseInt(eStr) : undefined) : Promise.reject("vidsrc needs tmdb"))
        ]);

        const streams = [];
        const captions = [];

        const proxyBase = `http://localhost:${port}/api/proxy?url=`;

        if (vidLinkResult.status === 'fulfilled' && vidLinkResult.value) {
            if (vidLinkResult.value.stream_urls && vidLinkResult.value.stream_urls.length > 0) {
                streams.push({
                    name: "VidLink (Multi-Lang)",
                    url: proxyBase + encodeURIComponent(vidLinkResult.value.stream_urls[0])
                });
            }
            if (vidLinkResult.value.captions) {
                captions.push(...vidLinkResult.value.captions);
            }
        }

        if (vaPlayerResult.status === 'fulfilled' && vaPlayerResult.value) {
            if (vaPlayerResult.value.stream_urls && vaPlayerResult.value.stream_urls.length > 0) {
                streams.push({
                    name: "VaPlayer (Fast)",
                    url: proxyBase + encodeURIComponent(vaPlayerResult.value.stream_urls[0])
                });
            }
        }

        if (vidsrcResult.status === 'fulfilled' && vidsrcResult.value && vidsrcResult.value.length > 0) {
            for (const item of vidsrcResult.value) {
                if (item.stream) {
                    streams.push({
                        name: "VidSrc.net",
                        url: proxyBase + encodeURIComponent(item.stream)
                    });
                }
            }
        }

        if (streams.length === 0) {
            return res.status(404).json({ error: 'Not found or failed to fetch streams' });
        }

        res.json({ success: true, streams, captions });
    } catch (err) {
        console.error("API error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Local Scraper API running on http://localhost:${port}`);
    console.log(`Try fetching: http://localhost:${port}/api?tmdb=76479&s=1&e=1`);
});
