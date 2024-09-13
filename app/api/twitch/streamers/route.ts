import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const clipsDir = path.join(process.cwd(), 'public', 'clips');
    const streamers = await fs.readdir(clipsDir);
    return NextResponse.json(streamers);
  } catch (error) {
    console.error('Error reading streamers directory:', error);
    return NextResponse.json(
      { error: 'Failed to read streamers' },
      { status: 500 }
    );
  }
}
