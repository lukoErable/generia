import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(request: Request) {
  const { topic, model } = await request.json();

  try {
    const prompt = `Generate 1 catchy title for a 3-minute YouTube video about ${topic}.`;
    const response = await hf.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 50,
        temperature: 0.7,
      },
    });

    const title = response.generated_text.trim();
    console.log(title);

    return NextResponse.json({ title }, { status: 200 });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}
