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
  const { topic, speech } = await request.json(); // Remove 'model' from here
  console.log(topic);
  const prompt = `Get the main subject from the text: ${topic} and generate a prompt to generate a 3 seconds short video that describe the main content by making a slow animation and making it beautiful : ${speech}`;

  try {
    const chatSession: ChatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: 'user',
          parts: [{ text: '' }],
        },
      ],
    });

    const result = await chatSession.sendMessage(prompt);
    const generatedSpeech = result.response.text();

    console.log(generatedSpeech);

    return NextResponse.json({ speech: generatedSpeech }, { status: 200 });
  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
