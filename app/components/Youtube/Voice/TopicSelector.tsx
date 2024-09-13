import React, { useEffect, useState } from 'react';

interface TopicData {
  category: string;
  topics: string[];
}

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onTopicSelect }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const categoryFiles = [
        'science',
        'space',
        'history',
        'technology',
        'nature',
        'universe',
      ];
      setCategories(categoryFiles);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadTopics = async () => {
      if (selectedCategory) {
        try {
          const response = await fetch(`/data/${selectedCategory}.json`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: TopicData = await response.json();
          setTopics(data.topics);
        } catch (error) {
          console.error('Error loading topics:', error);
          setTopics([]);
        }
      }
    };
    loadTopics();
  }, [selectedCategory]);

  return (
    <div className="bg-base-200 p-4 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        Topic Explorer
      </h2>

      {/* Conteneur des onglets avec défilement horizontal */}
      <div className="tabs tabs-boxed mb-6 overflow-x-auto whitespace-nowrap">
        {categories.map((category) => (
          <a
            key={category}
            className={`tab ${
              selectedCategory === category ? 'tab-active' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </a>
        ))}
      </div>

      {selectedCategory && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {topics.map((topic) => (
            <button
              key={topic}
              className="btn btn-ghost btn-block justify-start text-left normal-case hover:bg-primary hover:text-primary-content transition-colors duration-200"
              onClick={() => onTopicSelect(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {!selectedCategory && (
        <div className="text-center text-base-content/60 mt-4">
          Select a category to explore topics
        </div>
      )}
    </div>
  );
};

export default TopicSelector;
