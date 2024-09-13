import {
  ChatSession,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import axios from 'axios';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
const leonardoApiKey = process.env.LEONARDO_API_KEY;

if (!apiKey || !leonardoApiKey) {
  throw new Error('API keys are not set in environment variables');
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

async function getPrompts() {
  const filePath = path.join(process.cwd(), './prompts.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function POST(request: Request) {
  try {
    const { guidanceScale, motionStrength } = await request.json();
    const prompts = await getPrompts();

    // Generate a new prompt using Gemini
    const chatSession: ChatSession = model.startChat({ generationConfig });
    const promptGenerationResult = await chatSession.sendMessage(
      `Given these prompts i want you to create a new one similary. Just give me the text of the prompt you created: ${JSON.stringify(
        prompts
      )}`
    );
    const newPrompt = promptGenerationResult.response.text();

    console.log('new prompt :', newPrompt);

    // Generate image with Leonardo AI
    const imageGenerationResponse = await axios.post(
      'https://cloud.leonardo.ai/api/rest/v1/generations',
      {
        height: 1376,
        width: 768,
        modelId: '1e60896f-3c26-4296-8ecc-53e2afecc132',
        prompt: newPrompt,
        negative_prompt:
          'ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra legs, extra arms, disfigured, deformed, cross-eye, body out of frame, blurry, bad art, bad anatomy, blurred, watermark, grainy, duplicate',
        num_images: 1,
        promptMagic: true,
        photoReal: false,
        guidance_scale: guidanceScale,
        alchemy: true,
      },
      {
        headers: {
          Authorization: `Bearer ${leonardoApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const imageGenerationId =
      imageGenerationResponse.data.sdGenerationJob.generationId;

    // Wait for the image to be generated
    await new Promise((resolve) => setTimeout(resolve, 25000));

    // Get the generated image
    const imageResponse = await axios.get(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${imageGenerationId}`,
      {
        headers: {
          Authorization: `Bearer ${leonardoApiKey}`,
        },
      }
    );

    const imageId = imageResponse.data.generations_by_pk.generated_images[0].id;
    const imageUrl =
      imageResponse.data.generations_by_pk.generated_images[0].url;

    // Generate video motion
    const videoGenerationResponse = await axios.post(
      'https://cloud.leonardo.ai/api/rest/v1/generations-motion-svd',
      {
        imageId: imageId,
        motionStrength: motionStrength,
      },
      {
        headers: {
          Authorization: `Bearer ${leonardoApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const videoGenerationId =
      videoGenerationResponse.data.motionSvdGenerationJob.generationId;

    // Wait for the video to be generated
    await new Promise((resolve) => setTimeout(resolve, 89000));

    // Get the generated video
    const videoResponse = await axios.get(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${videoGenerationId}`,
      {
        headers: {
          Authorization: `Bearer ${leonardoApiKey}`,
        },
      }
    );

    const videoUrl =
      videoResponse.data.generations_by_pk.generated_images[0].motionMP4URL;

    return NextResponse.json(
      {
        id: `${Date.now()}`,
        prompt: newPrompt,
        url: imageUrl,
        motionMP4URL: videoUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
