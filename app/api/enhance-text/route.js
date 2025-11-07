// Text enhancement API using Google Gemini API
// Uses gemini-2.5-flash-lite model for fast and efficient text enhancement

const API_KEY = 'AIzaSyDcA88M7hc7DvxcVjaKLINl9h_PbCa_fTw';

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'API key not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prompt = `You are a professional communication assistant. Transform the following message into a clear, easy-to-understand, and professional format. 

Requirements:
- Make it simple and straightforward
- Use clear, everyday language
- Break down complex ideas into simple sentences
- Keep a friendly but professional tone
- Remove unnecessary jargon
- Maintain the core message and intent
- Return ONLY the enhanced message without quotes, explanations, or meta-commentary

Original message:
"${text}"

Enhanced message:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to enhance text'
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      const enhanced = data.candidates[0].content.parts[0].text.trim();
      return new Response(JSON.stringify({ 
        success: true, 
        enhanced,
        original: text
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        error: 'Invalid response from Gemini API'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error enhancing text:', error);
    return new Response(JSON.stringify({ error: 'Failed to enhance text' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
