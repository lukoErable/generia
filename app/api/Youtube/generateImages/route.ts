import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(request: Request) {
  const { prompts } = await request.json();

  try {
    const imagePromises = prompts.map(async (prompt: string) => {
      const response = await hf.textToImage({
        model: 'stabilityai/stable-diffusion-2',
        inputs: prompt,
      });
      return response;
    });

    const images = await Promise.all(imagePromises);
    const imageUrls = images.map((img) => URL.createObjectURL(new Blob([img])));
    console.log(imageUrls);

    return NextResponse.json({ images: imageUrls }, { status: 200 });
  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}
