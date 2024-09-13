interface Result {
  username: string;
  clipsDownloaded: number;
  mergedVideoPath: string;
}

interface ProgressDisplayProps {
  results: Result[];
}

export default function ProgressDisplay({ results }: ProgressDisplayProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Results:</h2>
      {results.map((result, index) => (
        <div key={index} className="mb-2">
          <p>Streamer: {result.username}</p>
          <p>Clips downloaded: {result.clipsDownloaded}</p>
          <p>
            Merged video:{' '}
            <a
              href={result.mergedVideoPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}
