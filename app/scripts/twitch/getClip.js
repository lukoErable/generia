const axios = require('axios');
const getAccessToken = require('./getToken');

const clientId = 't1ctk739qkqn2sda19k7wlgpfy37sn';

async function getPopularClips(broadcasterId) {
  try {
    const accessToken = await getAccessToken();

    // Get the first day of the current month
    const now = new Date();
    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const response = await axios.get('https://api.twitch.tv/helix/clips', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
      params: {
        first: 4, // Fetch up to 100 clips to sort manually
        started_at: firstDayOfMonth,
        ended_at: new Date().toISOString(),
        broadcaster_id: broadcasterId,
      },
    });

    // Sort clips by view count in descending order
    const sortedClips = response.data.data.sort(
      (a, b) => b.view_count - a.view_count
    );

    // Return the top 3 most viewed clips
    return sortedClips.slice(0, 3);
  } catch (error) {
    console.error('Erreur lors de la récupération des clips:', error);
    throw error;
  }
}

module.exports = getPopularClips;
