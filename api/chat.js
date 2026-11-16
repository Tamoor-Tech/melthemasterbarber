export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // keep as is
      }
    }
    const { messages } = body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing messages array' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({ error: 'API key configuration missing' });
    }

    const systemInstructionText = `You are Mel's AI Assistant for the official website of "Mel The Master Barber" in Smyrna, GA.
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      system_instruction: {
        parts: [
          {
            text: systemInstructionText
          }
        ]
      },
      contents: messages
    };

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Gemini API error:', data);
      return res.status(apiResponse.status || 500).json({ error: 'Failed to communicate with AI', details: data });
    }

    if (data.candidates && data.candidates.length > 0) {
      const aiMessage = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: aiMessage });
    } else {
      return res.status(200).json({ reply: "I'd be glad to help! Please contact Mel directly at (770) 895-1392 or visit our booking page at https://mel-the-master-barber.square.site/." });
    }

  } catch (error) {
    console.error('Error in Vercel function:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
