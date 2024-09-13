const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getClipDuration(filePath) {
  const ffprobeCommand = `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`;
  const duration = execSync(ffprobeCommand).toString().trim();
  return parseFloat(duration);
}

function applyFadeToClip(inputPath, outputPath) {
  const duration = getClipDuration(inputPath);
  const ffmpegCommand = `ffmpeg -i "${inputPath}" -vf "fade=t=out:st=${
    duration - 1
  }:d=1" -c:v libx264 -c:a aac "${outputPath}"`;
  execSync(ffmpegCommand);
}

function mergeClipsWithTransitions(clips, outputDir, username) {
  const newOutputDir = path.join(outputDir, 'merged');
  if (!fs.existsSync(newOutputDir)) {
    fs.mkdirSync(newOutputDir, { recursive: true });
  }

  const tempDir = path.join(outputDir, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const outputFilePath = path.join(newOutputDir, `${username}_merged.mp4`);
  const tempClips = [];
  let totalDuration = 0;

  for (const clip of clips) {
    const tempClipPath = path.join(tempDir, path.basename(clip));
    applyFadeToClip(clip, tempClipPath);
    const duration = getClipDuration(tempClipPath);
    totalDuration += duration;
    tempClips.push(tempClipPath);

    if (totalDuration >= 60) {
      break;
    }
  }

  const listFilePath = path.join(tempDir, 'clips.txt');
  const fileContent = tempClips
    .map((filePath) => `file '${filePath}'`)
    .join('\n');
  fs.writeFileSync(listFilePath, fileContent);

  const ffmpegCommand = `ffmpeg -f concat -safe 0 -i ${listFilePath} -c:v libx264 -c:a aac ${outputFilePath}`;
  execSync(ffmpegCommand);
  console.log(`Clips fusionnés avec succès : ${outputFilePath}`);
}

module.exports = mergeClipsWithTransitions;
