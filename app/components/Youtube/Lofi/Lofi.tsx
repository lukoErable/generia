import React, { useState } from 'react';

const Lofi: React.FC = () => {
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{
    percent: number;
    queuePosition: number | null;
  }>({ percent: 0, queuePosition: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setProgress({ percent: 0, queuePosition: null });
    setVideoUrl('');
    setCoverUrl('');

    try {
      const response = await fetch('/api/Youtube/generateVideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ desc: description }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response');
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim() === '') continue;
          const data = JSON.parse(line);

          if (data.status === 'progress') {
            setProgress({
              percent: data.percent,
              queuePosition: data.queuePosition,
            });
          } else if (data.status === 'complete') {
            setVideoUrl(data.videoURL);
            setCoverUrl(data.coverURL);
            setIsLoading(false);
          } else if (data.status === 'error') {
            throw new Error(data.message);
          }
        }
      }
    } catch (err) {
      setError('The old video is not finished yet');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lofi Video Generator</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter video description..."
          className="w-full p-2 border rounded"
          rows={4}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Video'}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading && (
        <div className="mb-4">
          {progress.queuePosition !== null && (
            <p>Queue position: {progress.queuePosition}</p>
          )}
          <p>Progress: {progress.percent}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress.percent}%` }}
            ></div>
          </div>
        </div>
      )}
      {videoUrl && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Generated Video:</h2>
          <video
            src={videoUrl}
            poster={coverUrl}
            controls
            className="w-full max-w-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Lofi;
