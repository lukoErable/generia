import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchWithRetry } from '../../../utils/fetchWithRetry';
import { VideoType } from '../../../utils/YouTubeTypes';

export const ShortVideo = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [model, setModel] = useState<string>(
    'meta-llama/Meta-Llama-3.1-8B-Instruct'
  );
  const [ttsModel, setTtsModel] = useState<string>('coqui/XTTS-v2');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoType, setVideoType] = useState<VideoType>('short');

  // State for short video
  const [shortSpeech, setShortSpeech] = useState<string>('');
  const [shortAudioSrc, setShortAudioSrc] = useState<string>('');
  const [shortImage, setShortImage] = useState<string | null>(null);
  const [shortVideoURL, setShortVideoURL] = useState<string | null>(null);

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };

  const generateShortVideo = useCallback(async () => {
    setIsLoading(true);
    try {
      // Generate speech
      const speechRes = await fetchWithRetry(
        '/api/Youtube/generateShortVideoSpeech',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, model }),
        }
      );
      const speechData: { speech: string } = await speechRes.json();
      setShortSpeech(speechData.speech);
      console.log(speechData);

      toast.info('Short video speech generated');

      const audioRes = await fetchWithRetry('/api/Youtube/textToSpeech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechData.speech, model: ttsModel }),
      });
      const audioBlob = await audioRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setShortAudioSrc(audioUrl);
      toast.info('Short video audio generated');

      // Get audio duration
      const audioDuration = await getAudioDuration(audioBlob);
      console.log('audio', audioDuration);

      // Generate prompt for video
      const promptRes = await fetchWithRetry(
        '/api/Youtube/generateVideoPrompt',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, speech: speechData.speech }),
        }
      );
      const promptData = await promptRes.json();
      console.log('Prompt data:', promptData);

      toast.info('Video prompt generated');
      console.log('Generating video...');

      // Generate video
      const videoRequestBody = {
        speechDuration: audioDuration,
        prompt: promptData, // Changed from promptData.prompt to promptData.speech
      };

      console.log('video request body', videoRequestBody);

      const videoRes = await fetch('/api/Youtube/generateVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoRequestBody),
      });
      const videoData = await videoRes.json();
      console.log('Video generation response:', videoData);

      if (videoData.success) {
        setShortVideoURL(videoData.data.videoURL);
        toast.success('Short video generated successfully');
      } else {
        toast.error('Failed to generate video');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        `Failed to generate short video content: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [topic, model, ttsModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoType === 'short') {
      setShortSpeech('');
      setShortAudioSrc('');
      setShortImage(null);
      generateShortVideo();
    }
  };

  const getAudioDuration = (audioBlob: Blob): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          audioContext.decodeAudioData(
            e.target.result as ArrayBuffer,
            (buffer) => {
              resolve(buffer.duration);
            },
            (error) => {
              reject(new Error('Error decoding audio data: ' + error.message));
            }
          );
        } else {
          reject(new Error('Failed to read audio file'));
        }
      };

      reader.onerror = () => reject(new Error('Error reading audio file'));
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  return {
    topic,
    setTopic,
    isLoading,
    model,
    setModel,
    ttsModel,
    setTtsModel,
    audioRef,
    videoType,
    setVideoType,
    shortSpeech,
    shortAudioSrc,
    shortImage,
    shortVideoURL,
    handleTopicSelect,
    handleSubmit,
  };
};
