import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Game.css';

const Game = ({ user }) => {
  const [gameState, setGameState] = useState({
    currentStage: 1,
    isPlaying: false,
    currentChallenge: null,
    playerPosition: { x: 0, y: 0 },
    inventory: {},
    homeDecorations: []
  });
  
  const [progress, setProgress] = useState(null);
  const [stages, setStages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeResult, setChallengeResult] = useState(null);
  const [showHomeBase, setShowHomeBase] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [questionAttempts, setQuestionAttempts] = useState({});
  const challengeInputRef = useRef(null);
  const [characters, setCharacters] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      const [progressResponse, stagesResponse, inventoryResponse, charactersResponse] = await Promise.all([
        axios.get('/api/user/progress'),
        axios.get('/api/game/stages'),
        axios.get('/api/user/inventory'),
        axios.get('/api/game/characters')
      ]);
      
      setProgress(progressResponse.data);
      setStages(stagesResponse.data);
      setCharacters(charactersResponse.data);
      setGameState(prev => ({
        ...prev,
        currentStage: progressResponse.data.current_stage,
        inventory: inventoryResponse.data.items,
        homeDecorations: inventoryResponse.data.home_decorations
      }));
    } catch (error) {
      setError('Failed to load game data');
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async (challengeType) => {
    try {
      // Check if we have wrong questions to retry first
      if (wrongQuestions.length > 0) {
        const retryQuestion = wrongQuestions[0];
        setGameState(prev => ({
          ...prev,
          currentChallenge: retryQuestion
        }));
        setShowChallenge(true);
        setChallengeAnswer('');
        setChallengeResult(null);
        return;
      }

      const response = await axios.get(`/api/game/challenge/${challengeType}`);
      setGameState(prev => ({
        ...prev,
        currentChallenge: response.data
      }));
      setShowChallenge(true);
      setChallengeAnswer('');
      setChallengeResult(null);
      
      // Focus on input after modal opens
      setTimeout(() => {
        if (challengeInputRef.current) {
          challengeInputRef.current.focus();
        }
      }, 300);
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  const submitChallengeAnswer = async () => {
    if (!challengeAnswer.trim() || isProcessingAnswer) return;

    setIsProcessingAnswer(true);

    try {
      const response = await axios.post('/api/game/verify-answer', {
        challenge_type: gameState.currentChallenge.type,
        answer: challengeAnswer,
        question: gameState.currentChallenge.question,
        word: gameState.currentChallenge.word
      });

      setChallengeResult(response.data);
      
      if (response.data.correct) {
        // Remove from wrong questions if it was there
        setWrongQuestions(prev => prev.filter(q => 
          q.question !== gameState.currentChallenge.question && 
          q.word !== gameState.currentChallenge.word
        ));
        
        // Reset attempts for this question
        setQuestionAttempts(prev => {
          const newAttempts = { ...prev };
          const questionKey = gameState.currentChallenge.question || gameState.currentChallenge.word;
          delete newAttempts[questionKey];
          return newAttempts;
        });
        
        // Update local progress
        setProgress(prev => ({
          ...prev,
          level: response.data.new_level,
          xp: response.data.new_xp,
          coins: response.data.new_coins,
          unlocked_areas: response.data.unlocked_areas
        }));

        // Auto-save progress
        await axios.put('/api/user/progress', {
          level: response.data.new_level,
          xp: response.data.new_xp,
          coins: response.data.new_coins,
          unlocked_areas: response.data.unlocked_areas
        });

        // Show success for 2 seconds, then move to next question
        setTimeout(() => {
          setChallengeResult(null);
          setChallengeAnswer('');
          setIsProcessingAnswer(false);
          
          // Start next challenge automatically (same category)
          startChallenge(gameState.currentChallenge.type);
        }, 2000);
      } else {
        // Track attempts for this question
        const questionKey = gameState.currentChallenge.question || gameState.currentChallenge.word;
        const currentAttempts = questionAttempts[questionKey] || 0;
        const newAttempts = currentAttempts + 1;
        
        setQuestionAttempts(prev => ({
          ...prev,
          [questionKey]: newAttempts
        }));

        if (newAttempts >= 2) {
          // Show correct answer after 2 attempts
          setChallengeResult({
            ...response.data,
            correct: false,
            showCorrectAnswer: true,
            correctAnswer: response.data.correct_answer
          });
          
          // Remove from wrong questions and move to next question
          setWrongQuestions(prev => prev.filter(q => 
            q.question !== gameState.currentChallenge.question && 
            q.word !== gameState.currentChallenge.word
          ));
          
          // Reset attempts for this question
          setQuestionAttempts(prev => {
            const newAttempts = { ...prev };
            delete newAttempts[questionKey];
            return newAttempts;
          });
          
          // Show correct answer for 3 seconds, then move to next question
          setTimeout(() => {
            setChallengeResult(null);
            setChallengeAnswer('');
            setIsProcessingAnswer(false);
            startChallenge(gameState.currentChallenge.type);
          }, 3000);
        } else {
          // Show incorrect message for 2 seconds, then clear for retry
          setTimeout(() => {
            setChallengeResult(null);
            setChallengeAnswer('');
            setIsProcessingAnswer(false);
          }, 2000);
        }
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      setIsProcessingAnswer(false);
    }
  };

  // These functions are kept for future use when implementing movement and item collection
  // const movePlayer = (direction) => {
  //   setGameState(prev => ({
  //     ...prev,
  //     playerPosition: {
  //       x: prev.playerPosition.x + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0),
  //       y: prev.playerPosition.y + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0)
  //     }
  //   }));
  // };

  // const collectItem = (itemType) => {
  //   setGameState(prev => ({
  //     ...prev,
  //     inventory: {
  //       ...prev.inventory,
  //       [itemType]: (prev.inventory[itemType] || 0) + 1
  //     }
  //   }));
  // };

  // const placeDecoration = (decoration) => {
  //   setGameState(prev => ({
  //     ...prev,
  //     homeDecorations: [...prev.homeDecorations, decoration]
  //   }));
  // };

  const saveInventory = async () => {
    try {
      await axios.put('/api/user/inventory', {
        items: gameState.inventory,
        home_decorations: gameState.homeDecorations
      });
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  };

  if (loading) {
    return (
      <div className="game-container">
        <div className="loading">Loading your adventure...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const currentStageData = stages[gameState.currentStage];

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🌲 MindCraft Adventure</h1>
        <p>Welcome to {currentStageData?.name}, {user.username}!</p>
      </div>

      {/* Game Stats */}
      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Level:</span>
          <span className="stat-value">{progress?.level}</span>
        </div>
        <div className="stat">
          <span className="stat-label">XP:</span>
          <span className="stat-value">{progress?.xp}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Coins:</span>
          <span className="stat-value">{progress?.coins}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Stage:</span>
          <span className="stat-value">{currentStageData?.emoji} {gameState.currentStage}</span>
        </div>
      </div>

      {/* Game World */}
      <div className="game-world">
        <div className="world-header">
          <h2>{currentStageData?.emoji} {currentStageData?.name}</h2>
          <p>{currentStageData?.description}</p>
        </div>

        <div className="world-grid">
          {/* Stage-specific content */}
          {gameState.currentStage === 1 && (
            <div className="number-woods">
              <div className="trees-section">
                <h3>🌳 Math Trees</h3>
                <p>Solve math problems to chop trees and collect coins!</p>
                <div className="tree-challenges">
                  <button 
                    onClick={() => startChallenge('math')}
                    className="btn btn-primary tree-btn"
                  >
                    🌳 Chop Tree (Math)
                  </button>
                  <button 
                    onClick={() => startChallenge('reading')}
                    className="btn btn-secondary tree-btn"
                  >
                    📜 Read Sign (Reading)
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState.currentStage === 2 && (
            <div className="word-village">
              <div className="village-section">
                <h3>🏘️ Word Village</h3>
                <p>Help villagers by choosing correct words and solving problems!</p>
                <div className="village-challenges">
                  <button 
                    onClick={() => startChallenge('reading')}
                    className="btn btn-primary villager-btn"
                  >
                    👤 Talk to Villager (Reading)
                  </button>
                  <button 
                    onClick={() => startChallenge('math')}
                    className="btn btn-secondary villager-btn"
                  >
                    🚪 Open Gate (Math)
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState.currentStage === 3 && (
            <div className="fraction-caves">
              <div className="cave-section">
                <h3>⛏️ Fraction Caves</h3>
                <p>Break blocks matching fractions and read cave stories!</p>
                <div className="cave-challenges">
                  <button 
                    onClick={() => startChallenge('math')}
                    className="btn btn-primary cave-btn"
                  >
                    ⛏️ Break Blocks (Fractions)
                  </button>
                  <button 
                    onClick={() => startChallenge('reading')}
                    className="btn btn-secondary cave-btn"
                  >
                    📖 Read Story (Reading)
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState.currentStage === 4 && (
            <div className="sky-tower">
              <div className="tower-section">
                <h3>☁️ The Sky Tower</h3>
                <p>Climb platforms by answering math and reading questions!</p>
                <div className="tower-challenges">
                  <button 
                    onClick={() => startChallenge('math')}
                    className="btn btn-primary tower-btn"
                  >
                    ☁️ Math Platform
                  </button>
                  <button 
                    onClick={() => startChallenge('reading')}
                    className="btn btn-primary tower-btn"
                  >
                    ☁️ Reading Platform
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Challenge Modal */}
      {showChallenge && gameState.currentChallenge && (
        <div className="challenge-modal">
          <div className="challenge-content">
            <button 
              className="challenge-close-btn"
              onClick={() => {
                setShowChallenge(false);
                setChallengeResult(null);
                setChallengeAnswer('');
                setIsProcessingAnswer(false);
                setWrongQuestions([]);
                setQuestionAttempts({});
              }}
              disabled={isProcessingAnswer}
            >
              ✕
            </button>
            <h3>Challenge Time!</h3>
            
            {wrongQuestions.length > 0 && (
              <div className="wrong-questions-indicator">
                <p>📝 You have {wrongQuestions.length} question(s) to retry!</p>
                {wrongQuestions.some(q => 
                  q.question === gameState.currentChallenge.question || 
                  q.word === gameState.currentChallenge.word
                ) && (
                  <p className="retry-indicator">🔄 Retrying this question...</p>
                )}
              </div>
            )}
            
            {gameState.currentChallenge.type === 'math' && (
              <div className="math-challenge">
                <p className="challenge-question">{gameState.currentChallenge.question}</p>
                <p className="challenge-hint">Hint: {gameState.currentChallenge.hint}</p>
              </div>
            )}
            
            {gameState.currentChallenge.type === 'reading' && (
              <div className="reading-challenge">
                <p className="challenge-hint">{gameState.currentChallenge.hint}</p>
                <p className="challenge-instruction">Type the word:</p>
              </div>
            )}

            {!challengeResult && (
              <div className="challenge-input">
                <input
                  ref={challengeInputRef}
                  type="text"
                  value={challengeAnswer}
                  onChange={(e) => setChallengeAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="challenge-answer-input"
                  onKeyPress={(e) => e.key === 'Enter' && submitChallengeAnswer()}
                  disabled={isProcessingAnswer}
                />
                <button 
                  onClick={submitChallengeAnswer} 
                  className="btn btn-primary"
                  disabled={isProcessingAnswer}
                >
                  {isProcessingAnswer ? 'Checking...' : 'Submit Answer'}
                </button>
              </div>
            )}

            {challengeResult && (
              <div className={`challenge-result ${challengeResult.correct ? 'correct' : 'incorrect'}`}>
                <h4>{challengeResult.correct ? '✅ Correct!' : '❌ Incorrect!'}</h4>
                {challengeResult.correct && (
                  <div className="rewards">
                    <p>+{challengeResult.earned_xp} XP</p>
                    <p>+{challengeResult.earned_coins} Coins</p>
                    {challengeResult.earned_item && (
                      <p className="item-earned">🎁 +1 {challengeResult.earned_item}</p>
                    )}
                    {challengeResult.new_level > progress.level && (
                      <p className="level-up">🎉 Level Up! You're now level {challengeResult.new_level}!</p>
                    )}
                  </div>
                )}
                {challengeResult.showCorrectAnswer && (
                  <div className="correct-answer">
                    <p>💡 The correct answer was: <strong>{challengeResult.correctAnswer}</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Actions */}
      <div className="game-actions">
        <button 
          onClick={() => setShowHomeBase(!showHomeBase)} 
          className="btn btn-secondary"
        >
          🏠 {showHomeBase ? 'Hide' : 'Show'} Home Base
        </button>
        <button 
          onClick={saveInventory} 
          className="btn btn-primary"
        >
          💾 Save Progress
        </button>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-secondary"
        >
          📊 Dashboard
        </button>
      </div>

      {/* Home Base */}
      {showHomeBase && (
        <div className="home-base">
          <h3>🏠 Your Home Base</h3>
          <div className="inventory-section">
            <h4>📦 Inventory</h4>
            <div className="inventory-grid">
              {Object.entries(gameState.inventory).map(([item, quantity]) => (
                <div key={item} className="inventory-item">
                  <div className="item-icon">
                    {item === 'diamond' && '💎'}
                    {item === 'stone' && '🪨'}
                    {item === 'wood' && '🪵'}
                    {item === 'gold' && '🥇'}
                    {item === 'iron' && '⚒️'}
                    {item === 'coal' && '🪨'}
                    {!['diamond', 'stone', 'wood', 'gold', 'iron', 'coal'].includes(item) && '📦'}
                  </div>
                  <span className="item-name">{item}</span>
                  <span className="item-quantity">x{quantity}</span>
                </div>
              ))}
              {Object.keys(gameState.inventory).length === 0 && (
                <div className="empty-inventory">
                  <p>📭 No items yet</p>
                  <p>Complete challenges to collect items!</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="decorations-section">
            <h4>🎨 Decorations</h4>
            <div className="decorations-grid">
              {gameState.homeDecorations.map((decoration, index) => (
                <div key={index} className="decoration-item">
                  <div className="decoration-icon">{decoration.emoji}</div>
                  <div className="decoration-name">{decoration.name}</div>
                </div>
              ))}
              {gameState.homeDecorations.length === 0 && (
                <div className="empty-decorations">
                  <p>🏠 No decorations yet</p>
                  <p>Earn special items to decorate your home!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage Navigation */}
      <div className="stage-navigation">
        <h3>🗺️ Available Stages</h3>
        <div className="stages-grid">
          {Object.entries(stages).map(([stageId, stageData]) => (
            <div 
              key={stageId} 
              className={`stage-card ${progress?.unlocked_areas?.includes(parseInt(stageId)) ? 'unlocked' : 'locked'}`}
            >
              <div className="stage-emoji">{stageData.emoji}</div>
              <div className="stage-name">{stageData.name}</div>
              <div className="stage-theme">{stageData.theme}</div>
              {!progress?.unlocked_areas?.includes(parseInt(stageId)) && (
                <div className="stage-locked">🔒 Locked (Need {stageData.xp_required} XP)</div>
              )}
              {progress?.unlocked_areas?.includes(parseInt(stageId)) && (
                <div className="stage-status">✅ Unlocked</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
