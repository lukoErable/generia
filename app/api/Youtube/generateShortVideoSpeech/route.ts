import {
  ChatSession,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Check if the API key is defined
const apiKey = process.env.GEMINI_API_KEY;
console.log(apiKey);

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model: GenerativeModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 3333,
};

export async function POST(request: Request) {
  const { topic } = await request.json();
  console.log(topic);

  try {
    const chatSession: ChatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: 'user',
          parts: [{ text: 'Hello' }],
        },
      ],
    });

    const prompt = `Give me a short text about ${topic} that I can read in about 1 minute. Make it interesting and educational.`;
    const result = await chatSession.sendMessage(prompt);
    const speech = result.response.text();

    console.log(speech);

    return NextResponse.json({ speech }, { status: 200 });
  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
