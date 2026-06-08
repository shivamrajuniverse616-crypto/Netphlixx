const axios = require('axios');
const https = require('https');

(async () => {
    try {
        const agent = new https.Agent({ rejectUnauthorized: false });
        
        console.log("Fetching SmashyStream...");
        const res = await axios.get("https://embed.smashystream.com/playere.php?tmdb=76479", {
            httpsAgent: agent,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        
        console.log("Response length:", res.data.length);
        console.log("Response preview:", res.data.substring(0, 500));
        
        // Find iframe inside it
        const match = res.data.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (match) {
            console.log("Found iframe URL:", match[1]);
        } else {
            console.log("No iframe found!");
        }
        
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
