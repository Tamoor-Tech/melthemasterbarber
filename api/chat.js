export default async function handler(req, res) {
  // CORS setup in case it's needed (though frontend and backend are on same origin usually)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid message array' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({ error: 'API key configuration missing' });
    }

    // System Instructions mapped into Gemini API format
    const systemInstruction = {
      role: 'user',
      parts: [
        {
          text: `You are Mel's AI Assistant for "Mel The Master Barber" website.
You must be friendly, professional, concise, confident, and helpful. You should sound appropriate for a luxury barber brand.
Do not invent information. Do not pretend to be human. Do not use excessive emojis. Do not pretend to book appointments yourself. Do not hallucinate prices, availability, services, discounts, promotions, missing staff, or appointment times.

If asked anything NOT in this prompt's knowledge base, reply with: 
"I'm not sure about that detail. Please contact Mel directly at (770) 895-1392 or melcuts@gmail.com for the most accurate information."

Business Knowledge Base:
- Business Name: Mel The Master Barber
- Location Name: Mel the Master Barber
- Address: 5350 United Drive SE, Suite 105, Smyrna, GA
- Phone: (770) 895-1392
- Email: melcuts@gmail.com

Pricing:
- Master Haircut — $45
- Beard Trim & Razor Shave — $35
- Haircut & Beard Combo — $65
- Edge-Up & Line-Up — $25
- Hot Towel Facial & Shave — $40
- Kids Master Haircut — $35

Hours:
- Tuesday – Friday: 9:00 AM – 7:00 PM
- Saturday: 8:00 AM – 5:00 PM
- Sunday & Monday: Closed

Booking:
- If a user asks to book, guide them to the real Booksy booking destination (https://booksy.com).
- NEVER claim you actually booked an appointment for them.
- Provide a clear call to action to "Book an Appointment" if appropriate.`
        }
      ]
    };

    // Construct the payload for Gemini model
    // Gemini 1.5 Flash uses the v1beta generateContent endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // We append the system instruction as the first message from the user conceptually, or use system_instruction parameter.
    // In gemini v1beta, systemInstruction is supported at the root of the request object:
    const payload = {
      system_instruction: {
        parts: [
          {
            text: systemInstruction.parts[0].text
          }
        ]
      },
      contents: messages // Expected format: [{role: 'user', parts: [{text: 'msg'}]}, {role: 'model', parts: [{text: 'msg'}]}]
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
      return res.status(apiResponse.status).json({ error: 'Failed to communicate with AI', details: data });
    }

    if (data.candidates && data.candidates.length > 0) {
      const aiMessage = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: aiMessage });
    } else {
      return res.status(500).json({ error: 'No response from AI' });
    }

  } catch (error) {
    console.error('Error in Vercel function:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
