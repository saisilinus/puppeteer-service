const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
require('dotenv').config();

const app = express();

async function renderUrl(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (compatible; PrerenderBot/1.0;)');

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Get the HTML after React has rendered
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

// Route: /render?url=https://yoursite.com/some-page
app.get('/render', async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing ?url param');
  }

  try {
    const html = await renderUrl(url);
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to render page');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Prerender server running at http://localhost:${PORT}`);
});
