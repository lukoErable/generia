// In YouTubeTypes.ts

export type VideoType = 'short' | 'long';

export interface VideoGenerationResponse {
  success: boolean;
  data?: {
    coverURL: string;
    videoURL: string;
  };
  error?: string;
}
