import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(request: Request) {
  const { topic, title, model } = await request.json();

  try {
    const prompt = `tell me a short text that I can reaf for a documentary about ${topic}. do it intersting and educativ`;
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-v0.1',
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
      },
    });

    const speech = response.generated_text.trim();
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
