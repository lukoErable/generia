import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const response = await axios.get(
      'https://cloud.leonardo.ai/api/rest/v1/generations/user/3d7e1fc0-5e91-4482-9ec0-77a0f0efe705?limit=20',
      {
        headers: {
          Authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
        },
      }
    );

    const images = response.data.generations.map((gen: any) => ({
      id: gen.id,
      url: gen.generated_images[0].url,
      motionMP4URL: gen.generated_images[0].motionMP4URL,
      prompt: gen.prompt,
    }));
    console.log(images);

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
