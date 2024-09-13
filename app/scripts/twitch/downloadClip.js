// downloadClip.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadClip(url, outputFilePath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(outputFilePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Clip téléchargé avec succès à:', outputFilePath);
        resolve(outputFilePath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du clip:', error);
    throw error;
  }
}

module.exports = downloadClip;
