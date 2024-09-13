import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styled from 'styled-components';

interface Item {
  id: string;
  url: string;
  prompt: string;
  motionMP4URL?: string;
  isLoading?: boolean;
  countdown?: number;
}

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 500px;
  margin: 0 auto;
  perspective: 1000px;

  @media (max-width: 768px) {
    height: 400px;
  }

  @media (max-width: 480px) {
    height: 300px;
  }
`;

const ItemContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s;
`;

const ItemWrapper = styled.span<{ index: number; totalItems: number }>`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%)
    rotateY(
      calc(${(props) => props.index} * ${(props) => 360 / props.totalItems}deg)
    )
    translateZ(400px);
  transform-style: preserve-3d;
  width: 200px;
  height: 300px;

  @media (max-width: 768px) {
    width: 150px;
    height: 225px;
    transform: translate(-50%, -50%)
      rotateY(
        calc(
          ${(props) => props.index} * ${(props) => 360 / props.totalItems}deg
        )
      )
      translateZ(300px);
  }

  @media (max-width: 480px) {
    width: 100px;
    height: 150px;
    transform: translate(-50%, -50%)
      rotateY(
        calc(
          ${(props) => props.index} * ${(props) => 360 / props.totalItems}deg
        )
      )
      translateZ(200px);
  }
`;

const ItemContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ReflectionWrapper = styled.div`
  position: absolute;
  top: 78%;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotateX(180deg) scaleY(0.5);
  opacity: 0.2;
  mask-image: linear-gradient(to top, rgba(0, 0, 0, 5), rgba(0, 0, 0, 0));
  pointer-events: none;
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 10;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }
`;

const PrevButton = styled(ArrowButton)`
  left: 10px;
`;

const NextButton = styled(ArrowButton)`
  right: 10px;
`;

const Carousel: React.FC<{ items: Item[]; isVideo: boolean }> = ({
  items,
  isVideo,
}) => {
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = items.length;
  const rotationAngle = 360 / totalItems;

  useEffect(() => {
    updateGallery();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rotation]);

  const updateGallery = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = `rotateY(${rotation}deg)`;
    }
    timerRef.current = setTimeout(() => {
      setRotation((prev) => prev - rotationAngle);
    }, 3000);
  };

  const handlePrev = () => {
    setRotation((prev) => prev + rotationAngle);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleNext = () => {
    setRotation((prev) => prev - rotationAngle);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <CarouselContainer>
      <ItemContainer ref={containerRef}>
        {items.map((item, index) => (
          <ItemWrapper key={item.id} index={index} totalItems={totalItems}>
            <ItemContent>
              {item.isLoading ? (
                <div className="relative w-full h-full">
                  <img
                    src={item.url}
                    alt="Loading"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-4xl font-bold">
                    {item.countdown}s
                  </div>
                </div>
              ) : isVideo ? (
                <video
                  src={item.motionMP4URL}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <div>
                  <img src={item.url} alt={item.prompt} />
                </div>
              )}
            </ItemContent>
            <ReflectionWrapper>
              <ItemContent>
                {item.isLoading ? (
                  <div className="relative w-full h-full">
                    <img
                      src={item.url}
                      alt="Loading reflection"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : isVideo ? (
                  <video
                    src={item.motionMP4URL}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img src={item.url} alt={`${item.prompt} reflection`} />
                )}
              </ItemContent>
            </ReflectionWrapper>
          </ItemWrapper>
        ))}
      </ItemContainer>
      <PrevButton onClick={handlePrev}>
        <FaChevronLeft size="1em" />
      </PrevButton>
      <NextButton onClick={handleNext}>
        <FaChevronRight size="1em" />
      </NextButton>
    </CarouselContainer>
  );
};

interface ImageCarouselProps {
  isGenerating: boolean;
  onGenerationComplete: (newItem: Item) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  isGenerating,
  onGenerationComplete,
}) => {
  const [images, setImages] = useState<Item[]>([]);
  const [videos, setVideos] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [activeButton, setActiveButton] = useState('images');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (isGenerating) {
      addLoadingItem();
    }
  }, [isGenerating]);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/Youtube/getLeonardoImages');
      const data = response.data;

      console.log(data);

      setImages(data.filter((item: Item) => !item.motionMP4URL));

      setVideos(data.filter((item: Item) => item.motionMP4URL));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const addLoadingItem = () => {
    const newLoadingItem: Item = {
      id: `loading-${Date.now()}`,
      url: '/loader.gif', // Make sure this path is correct
      prompt: 'Generating new item...',
      isLoading: true,
      countdown: 90,
    };

    setImages((prevImages) => [newLoadingItem, ...prevImages]);
    setVideos((prevVideos) => [newLoadingItem, ...prevVideos]);

    startCountdown(newLoadingItem);
  };

  const startCountdown = (loadingItem: Item) => {
    const countdownInterval = setInterval(() => {
      setImages((prevImages) =>
        prevImages.map((item) =>
          item.id === loadingItem.id && item.countdown && item.countdown > 0
            ? { ...item, countdown: item.countdown - 1 }
            : item
        )
      );
      setVideos((prevVideos) =>
        prevVideos.map((item) =>
          item.id === loadingItem.id && item.countdown && item.countdown > 0
            ? { ...item, countdown: item.countdown - 1 }
            : item
        )
      );
    }, 1000);

    // Clear the interval after 90 seconds
    setTimeout(() => {
      clearInterval(countdownInterval);
    }, 90000);
  };

  const updateLoadingItem = (newItem: Item) => {
    setImages((prevImages) =>
      prevImages.map((item) => (item.isLoading ? newItem : item))
    );
    setVideos((prevVideos) =>
      prevVideos.map((item) => (item.isLoading ? newItem : item))
    );
    onGenerationComplete(newItem);
  };

  if (loading) {
    return <div className="text-center text-2xl mt-10">Loading...</div>;
  }

  return (
    <div className="relative w-full flex flex-col">
      <div className="top-0 text-center p-4 sm:p-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => {
              setShowImages(true);
              setActiveButton('images');
            }}
            className={`px-4 sm:px-8 py-2 text-sm font-medium border border-dark-primary rounded-l-lg focus:z-10 focus:ring-2 focus:ring-dark-primary  ${
              activeButton === 'images'
                ? 'bg-dark-primary text-dark-background'
                : ' text-dark-primary hover:bg-dark-primary hover:text-dark-background'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => {
              setShowImages(false);
              setActiveButton('videos');
            }}
            className={`px-4 sm:px-8 py-2 text-sm font-medium border border-dark-primary rounded-r-lg focus:z-10 focus:ring-2 focus:ring-dark-primary  ${
              activeButton === 'videos'
                ? 'bg-dark-primary text-dark-background'
                : ' text-dark-primary hover:bg-dark-primary hover:text-dark-background'
            }`}
          >
            Motion
          </button>
        </div>
      </div>
      <div className="mt-32">
        {showImages ? (
          <Carousel items={images} isVideo={false} />
        ) : (
          <Carousel items={videos} isVideo={true} />
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;
