const axios = require('axios');

// Remplacez par vos informations
const clientId = 't1ctk739qkqn2sda19k7wlgpfy37sn';
const clientSecret = 'zhtll99cz6mtp55bhwe4k5kkjdnbpu';

async function getAccessToken() {
  try {
    const response = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    throw error;
  }
}

// Export de la fonction pour utilisation dans d'autres fichiers
module.exports = getAccessToken;
