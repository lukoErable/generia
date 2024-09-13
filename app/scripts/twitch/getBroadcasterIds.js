// getBroadcasterIds.js
const axios = require('axios');
const getAccessToken = require('./getToken');

const clientId = 't1ctk739qkqn2sda19k7wlgpfy37sn';

async function getBroadcasterIds(usernames) {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
      params: {
        login: usernames.join(','),
      },
    });

    return response.data.data.map((user) => ({
      username: user.login,
      broadcaster_id: user.id,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des broadcaster_id:', error);
    throw error;
  }
}

// Export de la fonction pour utilisation dans d'autres fichiers
module.exports = getBroadcasterIds;
