import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(request: Request) {
  const { topic, model } = await request.json();

  try {
    const prompt = `Create an outline for a long-form YouTube video (10+ minutes) about ${topic}. Include 5-7 main sections.`;
    const response = await hf.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
      },
    });

    const outline = response.generated_text.trim().split('\n').filter(Boolean);
    return NextResponse.json({ outline }, { status: 200 });
  } catch (error) {
    console.error('Error generating outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
}
