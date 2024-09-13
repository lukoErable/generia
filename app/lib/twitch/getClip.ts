import axios from 'axios';
import fs from 'fs';
import path from 'path';
import getAccessToken from './getToken';

const clientId = process.env.TWITCH_CLIENT_ID || '';
const jsonFilePath = path.join(process.cwd(), 'downloadedClips.json'); // Chemin du fichier JSON qui stocke les clips téléchargés

interface Clip {
  id: string;
  thumbnail_url: string;
  view_count: number;
}

// Lire les clips déjà téléchargés
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

export default async function getPopularClips(
  broadcasterId: string,
  clipCount: number
): Promise<Clip[]> {
  try {
    const accessToken = await getAccessToken();
    console.log('Access token obtained:', accessToken);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    console.log('Sending request to Twitch API...');
    const response = await axios.get('https://api.twitch.tv/helix/clips', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
      params: {
        first: 100,
        broadcaster_id: broadcasterId,
        started_at: oneWeekAgo.toISOString(),
        ended_at: new Date().toISOString(),
        sort: 'views',
      },
    });

    console.log('Response received from Twitch API');
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error('Unexpected response structure from Twitch API');
    }

    const allClips = response.data.data;
    console.log(`Retrieved ${allClips.length} clips from Twitch API`);

    // Lire les clips déjà téléchargés
    const downloadedClips = readDownloadedClips();

    // Filtrer les clips pour enlever ceux qui ont déjà été téléchargés
    const newClips = allClips.filter((clip: Clip) => !downloadedClips[clip.id]);

    // Trier par nombre de vues et limiter à 'clipCount'
    const sortedClips = newClips
      .sort((a: Clip, b: Clip) => b.view_count - a.view_count)
      .slice(0, clipCount);

    return sortedClips.map((clip: Clip) => ({
      id: clip.id,
      thumbnail_url: clip.thumbnail_url,
    }));
  } catch (error) {
    console.error('Error in getPopularClips:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
    }
    throw error;
  }
}
