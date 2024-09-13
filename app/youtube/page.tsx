'use client';

import { FC, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorFallback } from '../components/ErrorFallback';
import LoadingButton from '../components/Youtube/LoadingButton';
import Lofi from '../components/Youtube/Lofi/Lofi'; // Import the Lofi component
import ImageMotionGenerator from '../components/Youtube/Motion/ImageMotionGenerator';
import { GeneratedDocumentary } from '../components/Youtube/Voice/GeneratedDocumentary';
import { ModelSelect } from '../components/Youtube/Voice/ModelSelect';
import TopicSelector from '../components/Youtube/Voice/TopicSelector';
import { LongVideo } from '../components/Youtube/Voice/longVideo';
import { ShortVideo } from '../components/Youtube/Voice/shortVideo';

const YouTube: FC = () => {
  const {
    topic,
    setTopic,
    isLoading,
    model,
    setModel,
    ttsModel,
    setTtsModel,
    videoType,
    setVideoType,
    shortSpeech,
    shortAudioSrc,
    shortImage,
    shortVideoURL,
    handleSubmit,
    handleTopicSelect,
    audioRef,
  } = ShortVideo();

  const { longOutline, longContent, longAudioSrc, longImages } = LongVideo();

  const [activeTab, setActiveTab] = useState('generator');

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <main className="min-h-screen bg-gradient-to-b from-base-200 to-base-300 p-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center text-primary mb-8">
            AI Video Content Studio
          </h1>

          <div className="tabs tabs-boxed mb-8 justify-center">
            <a
              className={`tab ${activeTab === 'generator' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('generator')}
            >
              Text / Voice
            </a>
            <a
              className={`tab ${
                activeTab === 'imageMotion' ? 'tab-active' : ''
              }`}
              onClick={() => setActiveTab('imageMotion')}
            >
              Motion Images
            </a>
            <a
              className={`tab ${activeTab === 'lofi' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('lofi')}
            >
              Lofi
            </a>
          </div>

          {activeTab === 'generator' && (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-grow lg:w-2/3">
                <form
                  onSubmit={handleSubmit}
                  className="bg-base-100 p-6 rounded-xl shadow-lg mb-8"
                >
                  <h2 className="text-2xl font-bold mb-6 text-center text-secondary">
                    Generate Video Content
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <ModelSelect
                      label="Language Model"
                      value={model}
                      options={[
                        {
                          value: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                          label: 'Mixtral 8x7B',
                        },
                        {
                          value: 'meta-llama/Llama-2-70b-chat-hf',
                          label: 'Llama 2 70B',
                        },
                      ]}
                      onChange={setModel}
                    />
                    <ModelSelect
                      label="Text-to-Speech Model"
                      value={ttsModel}
                      options={[
                        { value: 'coqui/XTTS-v2', label: 'XTTS v2' },
                        {
                          value: 'facebook/fastspeech2-en-ljspeech',
                          label: 'FastSpeech2',
                        },
                      ]}
                      onChange={setTtsModel}
                    />
                  </div>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Topic</span>
                      </label>
                      <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter your topic here..."
                        className="input input-bordered w-full"
                      />
                    </div>
                    <ModelSelect
                      label="Video Type"
                      value={videoType}
                      options={[
                        { value: 'short', label: 'Short Video (3 min)' },
                        { value: 'long', label: 'Long Video (10+ min)' },
                      ]}
                      onChange={(value) =>
                        setVideoType(value as 'short' | 'long')
                      }
                    />
                  </div>
                  <LoadingButton
                    type="submit"
                    isLoading={isLoading}
                    label={`Generate ${
                      videoType === 'short' ? 'Short' : 'Long'
                    } Video Content`}
                    className="btn btn-primary w-full"
                  />
                </form>

                {videoType === 'short' && shortSpeech && (
                  <div className="bg-base-100 p-6 rounded-xl shadow-lg mb-8">
                    <h3 className="text-xl font-bold mb-4 text-secondary">
                      Short Video Content
                    </h3>
                    <p className="font-semibold mb-2">{topic}</p>
                    <p className="whitespace-pre-wrap mb-4">{shortSpeech}</p>
                    {shortAudioSrc && (
                      <audio
                        ref={audioRef}
                        src={shortAudioSrc}
                        controls
                        className="w-full mb-4"
                      />
                    )}
                    {shortVideoURL && (
                      <div>
                        <h4 className="text-lg font-semibold mb-2">
                          Generated Video
                        </h4>
                        <video
                          src={shortVideoURL}
                          controls
                          className="w-full rounded-lg"
                          poster={shortImage || undefined}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                )}

                {videoType === 'long' && longOutline.length > 0 && (
                  <GeneratedDocumentary
                    chapters={longOutline.map((title, index) => [
                      `chapter-${index + 1}`,
                      title,
                    ])}
                    chapterContent={Object.fromEntries(
                      longContent.map((content, index) => [
                        `chapter-${index + 1}`,
                        content,
                      ])
                    )}
                    images={longImages}
                  />
                )}
              </div>
              <div className="lg:w-1/3">
                <TopicSelector onTopicSelect={handleTopicSelect} />
              </div>
            </div>
          )}

          {activeTab === 'imageMotion' && <ImageMotionGenerator />}

          {activeTab === 'lofi' && <Lofi />}
        </div>
        <ToastContainer position="bottom-right" theme="colored" />
      </main>
    </ErrorBoundary>
  );
};

export default YouTube;
