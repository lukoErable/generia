'use client';

import { useEffect, useState } from 'react';
import ClipDownloader from '../components/Twitch/ClipDownloader';
import ClipGallery from '../components/Twitch/ClipGallery';
import StreamerList from '../components/Twitch/StreamerList';
import VideoPlayer from '../components/Twitch/VideoPlayer';

export default function Twitch() {
  const [streamers, setStreamers] = useState<string[]>([]);
  const [clipCount, setClipCount] = useState<number>(3);
  const [downloadedFiles, setDownloadedFiles] = useState<{
    [key: string]: { video: string; thumbnail: string }[];
  }>({});
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  useEffect(() => {
    const savedStreamers = localStorage.getItem('streamers');
    if (savedStreamers) {
      setStreamers(JSON.parse(savedStreamers));
    }

    const savedClipCount = localStorage.getItem('clipCount');
    if (savedClipCount) {
      setClipCount(Number(savedClipCount));
    }

    loadExistingClips();
  }, []);

  useEffect(() => {
    localStorage.setItem('streamers', JSON.stringify(streamers));
  }, [streamers]);

  useEffect(() => {
    localStorage.setItem('clipCount', clipCount.toString());
  }, [clipCount]);

  const loadExistingClips = async () => {
    try {
      const response = await fetch('/api/twitch/getExistingClips');
      const existingClips = await response.json();
      setDownloadedFiles(existingClips);
    } catch (error) {
      console.error('Erreur lors du chargement des clips existants:', error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          Gestion des Streamers Twitch
        </h1>
        <div className="flex flex-col justify-between md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="sticky top-8">
              <StreamerList
                streamers={streamers}
                setStreamers={setStreamers}
                clipCount={clipCount}
                setClipCount={setClipCount}
              />
              <ClipDownloader
                streamers={streamers}
                clipCount={clipCount}
                setDownloadedFiles={setDownloadedFiles}
              />
            </div>
          </div>
          <div className="md:w-1/4">
            <ClipGallery
              downloadedFiles={downloadedFiles}
              setDownloadedFiles={setDownloadedFiles}
              setCurrentVideo={setCurrentVideo}
            />
          </div>
        </div>
        {currentVideo && (
          <VideoPlayer
            videoSrc={currentVideo}
            onClose={() => setCurrentVideo(null)}
          />
        )}
      </div>
    </div>
  );
}
