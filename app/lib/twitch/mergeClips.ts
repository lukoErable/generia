import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Chemins vers ffprobe et ffmpeg
const ffprobePath =
  'C:\\Users\\lucas\\OneDrive\\Documents\\Projects\\ffmpeg-master-latest-win64-gpl\\bin\\ffprobe.exe';
const ffmpegPath =
  'C:\\Users\\lucas\\OneDrive\\Documents\\Projects\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe';

async function getClipDuration(filePath: string): Promise<number> {
  if (!fs.existsSync(filePath)) {
    console.error(`Fichier non trouvé : ${filePath}`);
    return NaN;
  }

  try {
    const ffprobeCommand = `"${ffprobePath}" -v error -show_entries format=duration -of csv=p=0 "${filePath}"`;
    console.log(`Exécution de la commande : ${ffprobeCommand}`);
    const { stdout, stderr } = await execAsync(ffprobeCommand);

    if (stderr) {
      console.error(`Erreur FFprobe : ${stderr}`);
    }

    console.log(`Sortie brute de FFprobe : ${stdout}`);
    const duration = stdout.trim();

    if (!duration || isNaN(Number(duration))) {
      throw new Error(
        `Durée invalide ou non récupérée pour le fichier ${filePath}`
      );
    }

    return parseFloat(duration);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la durée du clip: ${
        error instanceof Error ? error.message : 'Erreur inconnue'
      }`
    );
    if (error instanceof Error && error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    return NaN;
  }
}

async function applyFadeToClip(
  inputPath: string,
  outputPath: string
): Promise<void> {
  const duration = await getClipDuration(inputPath);

  if (isNaN(duration)) {
    console.error(`Durée non valide pour le fichier : ${inputPath}`);
    return;
  }

  try {
    const ffmpegCommand = `"${ffmpegPath}" -i "${inputPath}" -vf "fade=t=out:st=${
      duration - 1
    }:d=1" -c:v libx264 -c:a aac "${outputPath}"`;
    await execAsync(ffmpegCommand);
    console.log(`Fondu appliqué au clip : ${outputPath}`);
  } catch (error) {
    console.error(
      `Erreur lors de l'application du fondu: ${
        error instanceof Error ? error.message : 'Erreur inconnue'
      }`
    );
  }
}

export default async function mergeClipsWithTransitions(
  clips: string[],
  outputDir: string,
  username: string
): Promise<void> {
  const newOutputDir = path.join(outputDir, 'merged');
  const tempDir = path.join(outputDir, 'temp');

  // Création des répertoires nécessaires
  [newOutputDir, tempDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const outputFilePath = path.join(newOutputDir, `${username}_merged.mp4`);
  const tempClips: string[] = [];
  let totalDuration = 0;

  for (const clip of clips) {
    const tempClipPath = path.join(tempDir, path.basename(clip));
    try {
      await applyFadeToClip(clip, tempClipPath);

      if (!fs.existsSync(tempClipPath)) {
        console.error(`Fichier temporaire non trouvé : ${tempClipPath}`);
        continue;
      }

      const duration = await getClipDuration(tempClipPath);
      if (!isNaN(duration)) {
        totalDuration += duration;
        tempClips.push(tempClipPath);

        if (totalDuration >= 60) {
          break;
        }
      } else {
        console.error(`Durée non valide pour le fichier : ${tempClipPath}`);
        // Supprimez le fichier temporaire si la durée n'est pas valide
        fs.unlinkSync(tempClipPath);
      }
    } catch (error) {
      console.error(
        `Erreur lors du traitement du clip ${clip}: ${
          error instanceof Error ? error.message : 'Erreur inconnue'
        }`
      );
      // Supprimez le fichier temporaire en cas d'erreur
      if (fs.existsSync(tempClipPath)) {
        fs.unlinkSync(tempClipPath);
      }
    }
  }

  // Création du fichier clips.txt
  const listFilePath = path.join(tempDir, 'clips.txt');
  const fileContent = tempClips
    .map((filePath) => `file '${filePath.replace(/'/g, "\\'")}'`)
    .join('\n');
  fs.writeFileSync(listFilePath, fileContent);

  // Commande ffmpeg pour fusionner les clips
  try {
    const ffmpegCommand = `"${ffmpegPath}" -f concat -safe 0 -i "${listFilePath}" -c:v libx264 -c:a aac "${outputFilePath}"`;
    await execAsync(ffmpegCommand);
    console.log(`Clips fusionnés avec succès : ${outputFilePath}`);
  } catch (error) {
    console.error(
      `Erreur lors de la fusion des clips: ${
        error instanceof Error ? error.message : 'Erreur inconnue'
      }`
    );
  } finally {
    // Nettoyage des fichiers temporaires
    tempClips.forEach((tempClip) => {
      if (fs.existsSync(tempClip)) {
        fs.unlinkSync(tempClip);
      }
    });
    if (fs.existsSync(listFilePath)) {
      fs.unlinkSync(listFilePath);
    }
  }
}
