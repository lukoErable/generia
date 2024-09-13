import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { streamer, videoPath, thumbnailPath } = await request.json();

    // Supprimer le fichier vidéo
    fs.unlinkSync(path.join(process.cwd(), 'public', videoPath));

    // Supprimer le fichier thumbnail
    fs.unlinkSync(path.join(process.cwd(), 'public', thumbnailPath));

    // Vérifier si le dossier du streamer est vide
    const streamerDir = path.join(process.cwd(), 'public', 'clips', streamer);
    const files = fs.readdirSync(streamerDir);

    if (files.length === 0) {
      // Supprimer le dossier du streamer s'il est vide
      fs.rmdirSync(streamerDir);
    }

    return NextResponse.json(
      { message: 'Clip supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression du clip:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du clip' },
      { status: 500 }
    );
  }
}
