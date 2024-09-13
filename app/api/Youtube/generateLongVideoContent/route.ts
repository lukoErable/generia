import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(request: Request) {
  const { topic, section, model } = await request.json();

  try {
    const prompt = `Write a detailed script for the section "${section}" of a YouTube video about ${topic}. The content should be informative and engaging, suitable for a long-form video.`;
    const response = await hf.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
      },
    });

    const content = response.generated_text.trim();
    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
