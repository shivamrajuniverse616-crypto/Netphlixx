const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: false }); // Show browser to see what's happening
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let m3u8Found = false;

    page.on('request', request => {
        const url = request.url();
        if (url.includes('.m3u8')) {
            console.log("FOUND M3U8:", url);
            m3u8Found = true;
        }
    });

    console.log("Navigating to vidsrc.ru...");
    await page.goto('https://vidsrc.ru/embed/movie/76479', { waitUntil: 'networkidle2', timeout: 30000 });
    
    try {
        console.log("Waiting for play button or iframe...");
        // Wait for 5 seconds to see if there's a click needed
        await new Promise(r => setTimeout(r, 5000));
        
        // Try to click in the center of the screen to trigger play
        await page.mouse.click(page.viewport().width / 2, page.viewport().height / 2);
        console.log("Clicked center of screen");

        await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
        console.log("Click failed:", e.message);
    }

    if (!m3u8Found) {
        console.log("No m3u8 found.");
    }

    await browser.close();
})();
