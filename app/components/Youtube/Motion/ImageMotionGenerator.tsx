import React, { useState } from 'react';
import LoadingButton from '../LoadingButton';
import ImageCarousel from './ImageCarousel';

interface Item {
  id: string;
  url: string;
  prompt: string;
  motionMP4URL?: string;
}

const ImageMotionGenerator: React.FC = () => {
  const [guidanceScale, setGuidanceScale] = useState(7);
  const [motionStrength, setMotionStrength] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateWallpaper = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/Youtube/generateMotionVideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guidanceScale, motionStrength }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image and video');
      }

      const newItem: Item = await response.json();
      return newItem;
    } catch (err) {
      setError('An error occurred during generation');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = (newItem: Item) => {
    console.log('New item generated:', newItem);
    // You can add any additional logic here if needed
  };

  return (
    <div className="p-4 flex justify-between">
      {/* Colonne de gauche (vide pour l'équilibre) */}
      <div className="w-1/6"></div>

      {/* Colonne du milieu (carousel) */}
      <div className="w-1/2">
        <ImageCarousel
          isGenerating={isGenerating}
          onGenerationComplete={handleGenerationComplete}
        />
      </div>

      {/* Colonne de droite (inputs et bouton) */}
      <div className="w-1/3 flex justify-end mt-32">
        <div className="card-body w-full max-w-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateWallpaper();
            }}
            className="space-y-2"
          >
            <div className="space-y-2">
              <label className="label">
                <span className="label-text">
                  Guidance Scale: {guidanceScale}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(Number(e.target.value))}
                className="range range-primary w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="label">
                <span className="label-text">
                  Motion Strength: {motionStrength}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={motionStrength}
                onChange={(e) => setMotionStrength(Number(e.target.value))}
                className="range range-secondary w-full"
              />
            </div>
            <div className="text-center">
              <LoadingButton
                type="submit"
                isLoading={isGenerating}
                label="Generate Wallpaper"
                className="px-2 mt-4 py-1 w-full"
              />
            </div>
          </form>
          {error && <div className="alert alert-error mt-4">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ImageMotionGenerator;
