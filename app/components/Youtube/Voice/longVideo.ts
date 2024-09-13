import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchWithRetry } from '../../../utils/fetchWithRetry';
import { VideoType } from '../../../utils/YouTubeTypes';

export const LongVideo = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [model, setModel] = useState<string>(
    'meta-llama/Meta-Llama-3.1-8B-Instruct'
  );
  const [ttsModel, setTtsModel] = useState<string>('coqui/XTTS-v2');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoType, setVideoType] = useState<VideoType>('short');

  // State for long video
  const [longOutline, setLongOutline] = useState<string[]>([]);
  const [longContent, setLongContent] = useState<string[]>([]);
  const [longAudioSrc, setLongAudioSrc] = useState<string>('');
  const [longImages, setLongImages] = useState<string[]>([]);

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };

  const generateLongVideo = useCallback(async () => {
    setIsLoading(true);
    try {
      // Generate outline
      const outlineRes = await fetchWithRetry(
        '/api/Youtube/generateLongVideoOutline',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, model }),
        }
      );
      const outlineData: { outline: string[] } = await outlineRes.json();
      setLongOutline(outlineData.outline);
      toast.info('Long video outline generated');

      // Generate content for each section
      const contentPromises = outlineData.outline.map(
        (section: string, index: number) =>
          fetchWithRetry('/api/Youtube/generateLongVideoContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, section, model }),
          }).then(async (res) => {
            const data = await res.json();
            setLongContent((prev) => [...prev, data.content]);
            toast.info(`Long video section ${index + 1} content generated`);
            return data.content;
          })
      );
      const fullContent = await Promise.all(contentPromises);

      // Generate audio for full content
      const audioRes = await fetchWithRetry('/api/Youtube/textToSpeech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullContent.join(' '), model: ttsModel }),
      });
      const audioBlob = await audioRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setLongAudioSrc(audioUrl);
      toast.info('Long video audio generated');

      toast.success('Long video content generation completed!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        `Failed to generate long video content: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [topic, model, ttsModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoType) {
      setLongOutline([]);
      setLongContent([]);
      setLongAudioSrc('');
      setLongImages([]);
      generateLongVideo();
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
    longOutline,
    longContent,
    longAudioSrc,
    longImages,
    handleTopicSelect,
    handleSubmit,
  };
};
