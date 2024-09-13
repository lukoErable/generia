import { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface StreamerListProps {
  streamers: string[];
  setStreamers: React.Dispatch<React.SetStateAction<string[]>>;
  clipCount: number;
  setClipCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function StreamerList({
  streamers,
  setStreamers,
  clipCount,
  setClipCount,
}: StreamerListProps) {
  const [newStreamer, setNewStreamer] = useState('');

  useEffect(() => {
    async function loadStreamers() {
      try {
        const response = await fetch('/api/twitch/streamers');
        if (!response.ok) {
          throw new Error('Failed to fetch streamers');
        }
        const streamersList = await response.json();
        setStreamers(streamersList);
      } catch (error) {
        console.error('Error loading streamers:', error);
      }
    }

    loadStreamers();
  }, [setStreamers]);

  const handleAddStreamer = () => {
    if (newStreamer.trim() !== '') {
      setStreamers([...streamers, newStreamer.trim()]);
      setNewStreamer('');
    }
  };

  const handleRemoveStreamer = (index: number) => {
    const updatedStreamers = streamers.filter((_, i) => i !== index);
    setStreamers(updatedStreamers);
  };

  return (
    <div>
      <div className="space-y-4 mb-6">
        {streamers.map((streamer, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={streamer}
              readOnly
              className="input input-bordered w-full"
            />
            <button
              onClick={() => handleRemoveStreamer(index)}
              className="btn btn-square btn-error"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={newStreamer}
          onChange={(e) => setNewStreamer(e.target.value)}
          placeholder="Nom du nouveau streamer"
          className="input input-bordered w-full"
        />
        <button onClick={handleAddStreamer} className="btn btn-primary">
          <FaPlus />
        </button>
      </div>
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="number"
          value={clipCount}
          onChange={(e) => setClipCount(Number(e.target.value))}
          min="1"
          max="10"
          className="input input-bordered w-20"
        />
        <span>clips par streamer</span>
      </div>
    </div>
  );
}
