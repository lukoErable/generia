import axios from 'axios';

const clientId = process.env.TWITCH_CLIENT_ID || '';
const clientSecret = process.env.TWITCH_CLIENT_SECRET || '';

export default async function getAccessToken(): Promise<string> {
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
