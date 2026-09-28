/**
 * LOCAL DEV SERVER - Mel The Master Barber
 * Serves static files + handles /api/chat for local testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Load .env file manually
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
  console.log('✅ .env loaded successfully');
} catch (e) {
  console.warn('⚠️  No .env file found. Make sure GEMINI_API_KEY is set.');
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = urlObj.pathname;

  // ─── API Route: /api/chat ───────────────────────────────────────────────
  if (pathname === '/api/chat') {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
      res.end();
      return;
    }
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY not found in .env' }));
          return;
        }

        const systemText = `You are Mel's AI Assistant for "Mel The Master Barber" website.
Be friendly, professional, concise, confident, and helpful. Sound appropriate for a luxury barber brand.
Do not invent information. Do not pretend to be human. Do not use excessive emojis.
If asked anything NOT in this knowledge base, say: "I'm not sure about that detail. Please contact Mel directly at (770) 895-1392 or melcuts@gmail.com."

Business: Mel The Master Barber | Mel the Master Barber
Address: 5350 United Drive SE, Suite 105, Smyrna, GA
Phone: (770) 895-1392 | Email: melcuts@gmail.com

Pricing:
- Master Haircut — $45
- Beard Trim & Razor Shave — $35
- Haircut & Beard Combo — $65
- Edge-Up & Line-Up — $25
- Hot Towel Facial & Shave — $40
- Kids Master Haircut — $35

Hours: Tue–Fri 9AM–7PM | Sat 8AM–5PM | Sun & Mon Closed

Booking: Direct users to https://booksy.com — never claim to book appointments yourself.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = {
          system_instruction: { parts: [{ text: systemText }] },
          contents: messages
        };

        const apiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await apiRes.json();

        if (!apiRes.ok) {
          console.error('Gemini error:', JSON.stringify(data));
          res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Gemini API error', details: data }));
          return;
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ reply }));

      } catch (err) {
        console.error('Server error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
    return;
  }

  // ─── Static File Serving ────────────────────────────────────────────────
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // If no extension, try adding .html
  if (!path.extname(filePath)) filePath += '.html';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + pathname);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log('📋 Open in browser to test the chatbot\n');
});
