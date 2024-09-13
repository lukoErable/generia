import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { FaEye, FaEyeSlash, FaFolder, FaPlay, FaTrash } from 'react-icons/fa';

interface ClipGalleryProps {
  downloadedFiles: {
    [key: string]: { video: string; thumbnail: string }[];
  };
  setDownloadedFiles: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { video: string; thumbnail: string }[];
    }>
  >;
  setCurrentVideo: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ClipGallery({
  downloadedFiles,
  setDownloadedFiles,
  setCurrentVideo,
}: ClipGalleryProps) {
  const [visibleStreamers, setVisibleStreamers] = useState<{
    [key: string]: boolean;
  }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialisation de la visibilité des streamers (tous fermés par défaut)
  useEffect(() => {
    setVisibleStreamers((prevVisibleStreamers) => {
      // Conserver l'état précédent tout en ajoutant des streamers nouvellement téléchargés
      const updatedVisibility = { ...prevVisibleStreamers };

      Object.keys(downloadedFiles).forEach((streamer) => {
        if (!(streamer in updatedVisibility)) {
          updatedVisibility[streamer] = false; // Par défaut, on cache les nouveaux streamers
        }
      });

      return updatedVisibility;
    });
  }, [downloadedFiles]);

  // Gestion du défilement avec la molette pour scroller verticalement
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += event.deltaY; // Scroll en Y
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleWheel);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const toggleStreamerVisibility = (streamer: string) => {
    setVisibleStreamers((prev) => ({ ...prev, [streamer]: !prev[streamer] }));
  };

  const deleteClip = async (streamer: string, index: number) => {
    try {
      const response = await fetch('/api/twitch/deleteClip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamer,
          videoPath: downloadedFiles[streamer][index].video,
          thumbnailPath: downloadedFiles[streamer][index].thumbnail,
        }),
      });

      if (response.ok) {
        setDownloadedFiles((prev) => {
          const updatedFiles = {
            ...prev,
            [streamer]: prev[streamer].filter((_, i) => i !== index),
          };

          if (updatedFiles[streamer].length === 0) {
            const { [streamer]: _, ...rest } = updatedFiles;
            return rest;
          }

          return updatedFiles;
        });
      } else {
        console.error('Erreur lors de la suppression du clip');
      }
    } catch (error) {
      console.error('Erreur lors de la requête de suppression:', error);
    }
  };

  return (
    <div>
      {Object.keys(downloadedFiles).length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">
            Clips téléchargés
          </h2>
          <div className="space-y-8">
            {Object.entries(downloadedFiles).map(([streamer, files]) => (
              <div
                key={streamer}
                className="card bg-base-100 shadow-2xl hover:shadow-lg transition-shadow duration-300 rounded-lg"
              >
                <div className="p-2">
                  <h3
                    className="card-title flex justify-between items-center cursor-pointer"
                    onClick={() => toggleStreamerVisibility(streamer)}
                  >
                    <div className="flex items-center">
                      <FaFolder className="mt-1 mr-2 text-primary" />
                      {streamer}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({files.length} clips)
                      </span>
                    </div>
                    <div className="btn btn-sm btn-ghost">
                      {visibleStreamers[streamer] ? (
                        <FaEyeSlash className="text-red-500" />
                      ) : (
                        <FaEye className="text-green-500" />
                      )}
                    </div>
                  </h3>

                  {visibleStreamers[streamer] && (
                    <div
                      ref={scrollContainerRef}
                      className="grid grid-cols-1 gap-4 mt-4 overflow-y-auto max-h-96"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                          style={{ width: '250px', height: '141px' }} // Ajustez ces dimensions selon vos besoins
                        >
                          <Image
                            src={file.thumbnail}
                            alt={`Thumbnail for ${file.video}`}
                            layout="fill"
                            objectFit="cover"
                            objectPosition="center"
                            className="rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setCurrentVideo(file.video)}
                              className="btn btn-primary btn-sm mr-2"
                            >
                              <FaPlay />
                            </button>
                            <button
                              onClick={() => deleteClip(streamer, index)}
                              className="btn btn-error btn-sm"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
