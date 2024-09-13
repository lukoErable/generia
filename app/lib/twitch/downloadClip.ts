import axios from 'axios';
import fs from 'fs';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

export default async function downloadClip(
  url: string,
  outputFilePath: string
): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `Tentative de téléchargement ${attempt}/${MAX_RETRIES} pour ${url}`
      );

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000, // 30 secondes de timeout
      });

      const writer = fs.createWriteStream(outputFilePath);

      await new Promise<void>((resolve, reject) => {
        response.data.pipe(writer);
        let error: Error | null = null;
        writer.on('error', (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            console.log(`Clip téléchargé avec succès à : ${outputFilePath}`);
            resolve();
          } else {
            reject(error);
          }
        });
      });

      // Vérification de l'intégrité du fichier
      const stats = fs.statSync(outputFilePath);
      if (stats.size === 0) {
        throw new Error('Le fichier téléchargé est vide');
      }

      return; // Succès, sortie de la fonction
    } catch (error) {
      console.error(`
        Erreur lors du téléchargement du clip (tentative ${attempt}): ${error}`);

      if (attempt === MAX_RETRIES) {
        throw error; // Échec après toutes les tentatives
      }

      // Attente avant la prochaine tentative
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
}
