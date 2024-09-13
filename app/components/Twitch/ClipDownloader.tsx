import { useState } from 'react';
import { FaDownload } from 'react-icons/fa';

interface ClipDownloaderProps {
  streamers: string[];
  clipCount: number;
  setDownloadedFiles: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { video: string; thumbnail: string }[];
    }>
  >;
}

export default function ClipDownloader({
  streamers,
  clipCount,
  setDownloadedFiles,
}: ClipDownloaderProps) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatus('Téléchargement des clips...');
    setProgress(0);

    const filteredStreamers = streamers.filter((s) => s.trim() !== '');

    for (let i = 0; i < filteredStreamers.length; i++) {
      const streamer = filteredStreamers[i];
      try {
        const eventSource = new EventSource(
          '/api/twitch/download_clip?' +
            new URLSearchParams({
              streamer: streamer,
              clipCount: clipCount.toString(),
            })
        );

        await new Promise<void>((resolve, reject) => {
          eventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'clip') {
                setDownloadedFiles((prevFiles) => ({
                  ...prevFiles,
                  [data.streamer]: [
                    ...(prevFiles[data.streamer] || []),
                    { video: data.video, thumbnail: data.thumbnail },
                  ],
                }));
              } else if (data.type === 'complete') {
                eventSource.close();
                resolve();
              } else if (data.type === 'error') {
                console.error('Error event received:', data.message);
                eventSource.close();
                reject(new Error(data.message));
              }
            } catch (error) {
              console.error('Error parsing event data:', error);
              eventSource.close();
              reject(error);
            }
          };

          eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            eventSource.close();
            reject(
              new Error(
                `Erreur lors du téléchargement des clips pour ${streamer}`
              )
            );
          };
        });

        setProgress(((i + 1) / filteredStreamers.length) * 100);
      } catch (error) {
        console.error(`Erreur pour ${streamer}:`, error);
        setStatus(
          `Erreur lors du téléchargement des clips pour ${streamer}: ${error}`
        );
      }
    }

    setStatus('Téléchargement terminé pour tous les streamers.');
    setIsLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleSubmit}
        className={`btn btn-accent w-full mb-6 ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        <FaDownload className="mr-2" /> Télécharger les clips
      </button>
      {isLoading && (
        <progress
          className="progress w-full mb-4"
          value={progress}
          max="100"
        ></progress>
      )}
      {status && (
        <div
          className={`alert ${
            status.includes('terminé') ? 'alert-success' : 'alert-info'
          } mb-6`}
        >
          <div className="flex-1">
            <label>{status}</label>
          </div>
        </div>
      )}
    </div>
  );
}
