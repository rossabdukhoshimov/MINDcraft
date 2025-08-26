import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CharacterCatalog.css';

const CharacterCatalog = ({ user }) => {
  const [characters, setCharacters] = useState({});
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  useEffect(() => {
    fetchCharacterData();
  }, []);



  const fetchCharacterData = async () => {
    try {
      console.log('Fetching character data...');
      
      // Test characters endpoint first
      try {
        const charactersResponse = await axios.get('/api/game/characters');
        console.log('Characters response:', charactersResponse.data);
        setCharacters(charactersResponse.data);
      } catch (charError) {
        console.error('Characters error:', charError.response || charError);
        setError(`Characters error: ${charError.response?.data?.error || charError.message}`);
        return;
      }
      
      // Test inventory endpoint
      try {
        const inventoryResponse = await axios.get('/api/user/inventory');
        console.log('Inventory response:', inventoryResponse.data);
        setInventory(inventoryResponse.data);
      } catch (invError) {
        console.error('Inventory error:', invError.response || invError);
        setError(`Inventory error: ${invError.response?.data?.error || invError.message}`);
        return;
      }
      
    } catch (error) {
      console.error('General error:', error.response || error);
      setError(`General error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getProgressForCharacter = (characterId) => {
    if (!inventory?.character_cards) return 0;
    return inventory.character_cards[characterId] || 0;
  };

  const isCharacterUnlocked = (characterId) => {
    if (!inventory?.unlocked_characters) return false;
    return inventory.unlocked_characters.includes(characterId);
  };

  // Fallback data in case API fails
  const fallbackCharacters = {
    "steve": {
      "name": "Steve",
      "description": "The classic Minecraft hero",
      "rarity": "common",
      "category": "heroes",
      "image": "/images/characters/steve.png"
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#6c757d';
      case 'rare': return '#007bff';
      case 'legendary': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return 'Common';
      case 'rare': return 'Rare';
      case 'legendary': return 'Legendary';
      default: return 'Common';
    }
  };

  // Use fallback if no characters loaded
  const displayCharacters = Object.keys(characters).length > 0 ? characters : fallbackCharacters;

  // Handle keyboard events for ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedCharacter) {
        setSelectedCharacter(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCharacter]);

  const getFilteredCharacters = () => {
    if (selectedCategory === 'all') {
      return Object.entries(displayCharacters);
    }
    return Object.entries(displayCharacters).filter(([id, char]) => char.category === selectedCategory);
  };

  const getCategories = () => {
    const categories = new Set(Object.values(displayCharacters).map(char => char.category));
    return ['all', ...Array.from(categories)];
  };

  if (loading) {
    return (
      <div className="character-catalog-container">
        <div className="loading">Loading character catalog...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-catalog-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const filteredCharacters = getFilteredCharacters();
  const categories = getCategories();

  return (
    <div className="character-catalog-container">
      <div className="catalog-header">
        <h1>🎮 Minecraft Character Collection</h1>
        <p>Collect all the characters by answering questions correctly!</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <h3>Filter by Category:</h3>
        <div className="category-buttons">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Character Grid */}
      <div className="characters-grid">
        {filteredCharacters.map(([characterId, character]) => {
          const progress = getProgressForCharacter(characterId);
          const isUnlocked = isCharacterUnlocked(characterId);
          const progressPercentage = (progress / 4) * 100;

          return (
            <div 
              key={characterId} 
              className={`character-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              style={{
                filter: isUnlocked ? 'none' : `blur(${Math.max(0, 4 - progress)}px)`,
                opacity: isUnlocked ? 1 : 0.7 + (progress * 0.075)
              }}
              onClick={() => {
                if (isUnlocked) {
                  setSelectedCharacter({ id: characterId, ...character });
                }
              }}
            >
              <div className="character-image">
                <img 
                  src={character.image} 
                  alt={character.name}
                  className="character-img"
                  onError={(e) => {
                    console.error(`Failed to load image: ${character.image}`);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              <div className="character-info">
                <h3 className="character-name">{character.name}</h3>
                <p className="character-description">{character.description}</p>
                
                <div className="character-rarity" style={{ color: getRarityColor(character.rarity) }}>
                  {getRarityLabel(character.rarity)}
                </div>
                
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {progress}/4 {isUnlocked ? '✅ Unlocked!' : 'answers needed'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collection Stats */}
      <div className="collection-stats">
        <h3>Collection Progress</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{inventory?.unlocked_characters?.length || 0}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{Object.keys(displayCharacters).length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Math.round(((inventory?.unlocked_characters?.length || 0) / Object.keys(displayCharacters).length) * 100)}%
            </span>
            <span className="stat-label">Complete</span>
          </div>
        </div>
      </div>

      {/* Character Popup Modal */}
      {selectedCharacter && (
        <div className="character-popup-overlay" onClick={() => setSelectedCharacter(null)}>
          <div className="character-popup" onClick={(e) => e.stopPropagation()}>
            <button 
              className="popup-close-btn"
              onClick={() => setSelectedCharacter(null)}
            >
              ✕
            </button>
            <div className="popup-character-image">
              <img 
                src={selectedCharacter.image} 
                alt={selectedCharacter.name}
                className="popup-character-img"
              />
            </div>
            <div className="popup-character-info">
              <h2 className="popup-character-name">{selectedCharacter.name}</h2>
              <p className="popup-character-description">{selectedCharacter.description}</p>
              <div className="popup-character-rarity" style={{ color: getRarityColor(selectedCharacter.rarity) }}>
                {getRarityLabel(selectedCharacter.rarity)}
              </div>
              <div className="popup-character-category">
                Category: {selectedCharacter.category.charAt(0).toUpperCase() + selectedCharacter.category.slice(1)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCatalog;
