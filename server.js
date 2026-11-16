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

const SYSTEM_INSTRUCTION = `You are Mel's AI Assistant for the official website of "Mel The Master Barber" in Smyrna, GA.
Your persona is friendly, professional, concise, confident, and welcoming, embodying a luxury barber lounge experience.
Always provide accurate, factual answers based strictly on the business information below. Never invent or hallucinate prices, services, availability, discounts, or appointment confirmations.

If asked anything NOT covered by this knowledge base, respond politely:
"I don't have that specific information. Please contact Mel directly at (770) 895-1392 or melcuts@gmail.com, or check our booking page at https://mel-the-master-barber.square.site/."

--- BUSINESS INFORMATION ---
- Business Name: Mel The Master Barber (Mel the Master Barber)
- Address: 5350 United Drive SE, Suite 105, Smyrna, GA 30080
- Phone: (770) 895-1392
- Email: melcuts@gmail.com
- Online Booking: https://mel-the-master-barber.square.site/

--- BUSINESS HOURS ---
- Monday – Thursday: 7:00 AM – 6:00 PM
- Friday: 8:00 AM – 6:00 PM
- Saturday: 8:00 AM – 5:00 PM
- Sunday: 12:00 PM – 4:00 PM

--- SERVICES & PRICING ---

1. HAIRCUT SERVICES:
- Regular Haircut / Master Haircut: $45 (Tailored haircut with custom consultation, razor line finish, and styling; 30 min)
- Haircut w/ Razor: $50 (Detailed haircut finished with traditional straight-razor detailing; 30 min)
- Kids Haircut (17 and under): $30 (Precision haircut for youth 17 and under; 30 min)
- Shape Up: $25.00 (Razor-sharp perimeter line up / edge-up; 20-30 min)

2. BEARD SERVICES & BEARD TREATMENT:
- Beard Treatment: $65 (Specialized beard treatment including deep conditioning, hot towel therapy, and precise beard shaping; 30 min)
- Beard Trim: $25.00 (Meticulous trimming for a neat, well-kept beard; 20-30 min)

3. PACKAGES & COMBOS (HAIRCUT, BEARD, FACIAL & UPGRADES):
- Haircut w/ Beard Treatment: $110 (Standard, 45 min) | With Hair Wash: $120
- Haircut w/ Beard Treatment & Facial: $175 (Standard, 60 min) | With Hair Wash: $185
- Full Haircut with Beard: $50.00 (Includes hair and beard; 30-45 min)
- Haircut, Beard, & Shampoo: $65.00 (The full triple-service experience: full haircut, beard trim, and an invigorating shampoo hair wash; 30-55 min)
- Haircut & Facial: $125.00 (Premium master haircut combined with a relaxing hot towel facial; 30-60 min)
- Haircut, Facial, & Shampoo (Executive Ultimate / Signature Combo): $135.00 (The ultimate luxury grooming experience: haircut, rejuvenating facial, and scalp shampoo wash; 30-75 min)

4. HAIR WASH / SHAMPOO OPTIONS:
- Yes, we offer hair wash!
- Shampoo (Standalone Hair Wash): $10.00 (Invigorating scalp cleanse and conditioning wash; 15 min)
- Haircut, Beard, & Shampoo: $65.00 (Full haircut, beard care, and hair wash combo)
- Haircut, Facial, & Shampoo: $135.00 (Ultimate luxury package including haircut, facial, and hair wash)

5. OTHER SERVICES:
- Facial: $65.00 (Deep pore cleanse, hot towel relaxation, rejuvenating mask, and facial massage; 30 min)
- Eyebrows: $25.00 (Clean and natural arch shaping; 15 min)
- Designs: $5 – $100+ (Custom creative hair art and razor-carved designs; 20 min)

--- APPOINTMENT BOOKING GUIDELINES ---
- All appointments must be booked through the official Square booking page: https://mel-the-master-barber.square.site/
- Never claim that you have booked, reserved, modified, or cancelled an appointment. You cannot schedule directly in chat. Always direct clients to the Square booking link.
- Keep responses concise, helpful, and appropriately formatted with clear pricing and markdown links.`;

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = urlObj.pathname;

  // ─── API Route: /api/chat ───────────────────────────────────────────────
  if (pathname === '/api/chat') {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(405, corsHeaders);
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const messages = parsed.messages;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({ error: 'Invalid or missing messages array' }));
          return;
        }

        if (!apiKey) {
          console.error('Missing GEMINI_API_KEY');
          res.writeHead(500, corsHeaders);
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured in .env' }));
          return;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = {
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
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
          res.writeHead(apiRes.status || 500, corsHeaders);
          res.end(JSON.stringify({ error: 'Gemini API error', details: data }));
          return;
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) {
          res.writeHead(200, corsHeaders);
          res.end(JSON.stringify({ reply: "I'd be glad to help! Please contact Mel directly at (770) 895-1392 or visit our booking page at https://mel-the-master-barber.square.site/." }));
          return;
        }

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ reply }));

      } catch (err) {
        console.error('Server error:', err);
        res.writeHead(500, corsHeaders);
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
