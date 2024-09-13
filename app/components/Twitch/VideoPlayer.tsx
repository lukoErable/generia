import { FaStop } from 'react-icons/fa';

interface VideoPlayerProps {
  videoSrc: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoSrc, onClose }: VideoPlayerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg max-w-4xl w-full shadow-xl">
        <video src={videoSrc} controls autoPlay className="w-full rounded-lg" />
        <button onClick={onClose} className="btn btn-primary mt-4">
          <FaStop className="mr-2" /> Fermer la vidéo
        </button>
      </div>
    </div>
  );
}
