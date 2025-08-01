import fetch from 'node-fetch';

export default async function handler(request, response) {
  try {
    const { clientName, task } = await request.json();

    // Get the API key from Vercel's environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    const prompt = `Act as a marketing consultant's assistant. A client named '${clientName}' has just completed a task: '${task}'. Generate a 'gentle upgrade prompt' to encourage her to buy a premium service. The prompt should be friendly, professional, and focus on helping her achieve her goals faster. The output should be a single, conversational message.`;

    const payload = { 
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        // Use gemini-2.5-flash-preview-05-20 for text generation
        model: "gemini-2.5-flash-preview-05-20"
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
        throw new Error(`API call failed with status: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    const generatedMessage = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedMessage) {
        throw new Error("Invalid response from Gemini API.");
    }

    response.status(200).json({ generatedMessage });
  } catch (error) {
    console.error('Error in serverless function:', error);
    response.status(500).json({ error: error.message });
  }
}
