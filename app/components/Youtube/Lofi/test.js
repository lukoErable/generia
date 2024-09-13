const axios = require('axios');
const fs = require('fs');

async function generateMusic(prompt) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/musicgen-medium',
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: 'Bearer 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',
        },
        responseType: 'arraybuffer',
      }
    );

    // Le fichier audio est retourné en tant que buffer
    const audioBuffer = response.data;

    // Sauvegardez le buffer dans un fichier audio
    fs.writeFileSync('generated_music.wav', Buffer.from(audioBuffer));

    console.log('Musique générée et sauvegardée dans generated_music.wav');
  } catch (error) {
    console.error('Erreur lors de la génération de musique:', error);
  }
}

// Exemple d'utilisation
const prompt =
  'generate a lofi song with piano notes and other instruments like naruto sad songs ';
generateMusic(prompt);
