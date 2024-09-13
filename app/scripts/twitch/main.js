const fs = require('fs');
const path = require('path');
const getBroadcasterIds = require('./getBroadcasterIds');
const getPopularClips = require('./getClip');
const downloadClip = require('./downloadClip');
const mergeClipsWithTransitions = require('./mergeClips');

(async () => {
  const streamers = ['domingo'];

  try {
    const broadcasterIds = await getBroadcasterIds(streamers);

    for (const { username, broadcaster_id } of broadcasterIds) {
      console.log(`Récupération des clips pour ${username}...`);

      const streamerDir = path.join(__dirname, 'clips', username);
      if (!fs.existsSync(streamerDir)) {
        fs.mkdirSync(streamerDir, { recursive: true });
      }

      const clips = await getPopularClips(broadcaster_id);
      const downloadedClips = [];

      for (const clip of clips) {
        const videoUrl = clip.thumbnail_url.split('-preview-')[0] + '.mp4';
        const filename = `${username}_${clip.id}.mp4`;
        const filePath = path.join(streamerDir, filename);

        // Télécharger le clip dans le dossier du streamer
        await downloadClip(videoUrl, filePath);
        downloadedClips.push(filePath);
      }

      // Fusionner les clips avec transitions
      if (downloadedClips.length > 0) {
        mergeClipsWithTransitions(downloadedClips, streamerDir, username);
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
})();
