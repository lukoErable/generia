import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

interface ClipInfo {
  video: string;
  thumbnail: string;
}

interface ExistingClips {
  [streamer: string]: ClipInfo[];
}

export async function GET() {
  const clipsDir = path.join(process.cwd(), 'public', 'clips');
  const existingClips: ExistingClips = {};

  if (fs.existsSync(clipsDir)) {
    const streamers = fs.readdirSync(clipsDir);

    streamers.forEach((streamer) => {
      const streamerDir = path.join(clipsDir, streamer);
      const files = fs.readdirSync(streamerDir);

      existingClips[streamer] = files
        .filter((file) => file.endsWith('.mp4'))
        .map((file) => ({
          video: `/clips/${streamer}/${file}`,
          thumbnail: `/clips/${streamer}/${file.replace(
            '.mp4',
            '_thumbnail.jpg'
          )}`,
        }));
    });
  }

  return NextResponse.json(existingClips);
}
