// lib/getBroadcasterIds.ts
import axios from 'axios';
import getAccessToken from './getToken';

const clientId = process.env.TWITCH_CLIENT_ID || '';

interface BroadcasterInfo {
  username: string;
  broadcaster_id: string;
}

export default async function getBroadcasterIds(
  usernames: string[]
): Promise<BroadcasterInfo[]> {
  try {
    const accessToken = await getAccessToken();

    // Nettoyer et formater les noms d'utilisateurs
    const formattedUsernames = usernames
      .map((username) => username.trim().toLowerCase())
      .filter((username) => username !== '');

    if (formattedUsernames.length === 0) {
      throw new Error("Aucun nom d'utilisateur valide fourni.");
    }

    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
      params: {
        login: formattedUsernames.join(','),
      },
    });

    if (!response.data.data || response.data.data.length === 0) {
      throw new Error('Aucun utilisateur trouvé pour les noms fournis.');
    }

    const foundUsers = response.data.data.map((user: any) => ({
      username: user.login,
      broadcaster_id: user.id,
    }));

    const notFoundUsers = formattedUsernames.filter(
      (username) => !foundUsers.some((user: any) => user.username === username)
    );

    if (notFoundUsers.length > 0) {
      console.warn(`Utilisateurs non trouvés : ${notFoundUsers.join(', ')}`);
    }

    return foundUsers;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Erreur API Twitch : ${error.response.status} - ${error.response.data.message}`
      );
    }
    throw error;
  }
}
