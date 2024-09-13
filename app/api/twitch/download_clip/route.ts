import { exec } from 'child_process';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import util from 'util';
import downloadClip from '../../../lib/twitch/downloadClip';
import getBroadcasterIds from '../../../lib/twitch/getBroadcasterIds';
import getPopularClips from '../../../lib/twitch/getClip';

const execAsync = util.promisify(exec);

const jsonFilePath = path.join(process.cwd(), 'downloadedClips.json'); // Fichier JSON pour stocker les clips téléchargés

// Lire le fichier JSON
function readDownloadedClips() {
  if (fs.existsSync(jsonFilePath)) {
    try {
      const data = fs.readFileSync(jsonFilePath, 'utf8');
      if (!data.trim()) {
        console.warn('downloadedClips.json is empty');
        return {};
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading or parsing downloadedClips.json:', error);
      return {};
    }
  }
  return {};
}

// Écrire dans le fichier JSON
function writeDownloadedClips(data: any) {
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
}

const ffmpegPath =
  'C:\\Users\\lucas\\OneDrive\\Documents\\Projects\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe';

async function extractFirstFrame(
  videoPath: string,
  outputPath: string
): Promise<void> {
  try {
    const ffmpegCommand = `"${ffmpegPath}" -i "${videoPath}" -vframes 1 -q:v 2 "${outputPath}"`;
    const { stdout, stderr } = await execAsync(ffmpegCommand);
    if (stderr) {
      console.error('Erreur ffmpeg:', stderr);
    }
  } catch (error) {
    console.error("Erreur lors de l'exécution de ffmpeg:", error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const streamer = searchParams.get('streamer') || '';
  const clipCount = parseInt(searchParams.get('clipCount') || '3');
  console.log(
    `Received request for streamer: ${streamer}, clipCount: ${clipCount}`
  );

  // Set up SSE
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (data: any) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  NextResponse.json(
    { message: 'Streaming started' },
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    }
  );

  (async () => {
    try {
      console.log(`Getting broadcaster IDs for ${streamer}`);
      const broadcasterIds = await getBroadcasterIds([streamer]);
      console.log(`Broadcaster IDs:`, broadcasterIds);

      if (broadcasterIds.length === 0) {
        throw new Error(`No broadcaster found for ${streamer}`);
      }

      // Lire les clips déjà téléchargés depuis le fichier JSON
      const downloadedClips = readDownloadedClips();

      for (const { username, broadcaster_id } of broadcasterIds) {
        console.log(`Processing clips for ${username} (ID: ${broadcaster_id})`);

        const streamerDir = path.join(
          process.cwd(),
          'public',
          'clips',
          username
        );
        if (!fs.existsSync(streamerDir)) {
          fs.mkdirSync(streamerDir, { recursive: true });
        }

        const clips = await getPopularClips(broadcaster_id, clipCount);
        console.log(`Retrieved ${clips.length} clips for ${username}`);

        for (const clip of clips) {
          const videoUrl = clip.thumbnail_url.split('-preview-')[0] + '.mp4';
          const filename = `${username}_${clip.id}.mp4`;
          const filePath = path.join(streamerDir, filename);
          const thumbnailPath = path.join(
            streamerDir,
            `${username}_${clip.id}_thumbnail.jpg`
          );

          // Vérifier si le clip a déjà été téléchargé
          if (downloadedClips[clip.id]) {
            console.log(`Clip déjà téléchargé : ${clip.id}`);
            continue; // Passer au clip suivant
          }

          try {
            await downloadClip(videoUrl, filePath);

            await extractFirstFrame(filePath, thumbnailPath);

            if (fs.existsSync(thumbnailPath)) {
              console.log(`Image extraite avec succès : ${thumbnailPath}`);
            }

            // Ajouter le clip à la liste des téléchargements
            downloadedClips[clip.id] = {
              video: `/clips/${username}/${filename}`,
              thumbnail: `/clips/${username}/${path.basename(thumbnailPath)}`,
              view_count: clip.view_count,
            };

            // Envoyer un événement pour mettre à jour l'interface
            await sendEvent({
              type: 'clip',
              streamer: username,
              video: `/clips/${username}/${filename}`,
              thumbnail: `/clips/${username}/${path.basename(thumbnailPath)}`,
            });
          } catch (error) {
            console.error(
              `Erreur lors du traitement du clip pour ${username}: ${error}`
            );
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Sauvegarder les clips téléchargés dans le fichier JSON
      writeDownloadedClips(downloadedClips);

      await sendEvent({
        type: 'complete',
        message: `Tous les clips ont été téléchargés pour ${streamer}.`,
      });
    } catch (error) {
      console.error('Error in API route:', error);
      await sendEvent({
        type: 'error',
        message: `Une erreur est survenue lors du téléchargement des clips pour ${streamer}: ${error}`,
      });
    } finally {
      writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
