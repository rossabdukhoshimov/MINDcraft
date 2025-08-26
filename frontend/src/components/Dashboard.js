import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [progress, setProgress] = useState(null);
  const [stages, setStages] = useState({});
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [progressResponse, stagesResponse, inventoryResponse] = await Promise.all([
        axios.get('/api/user/progress'),
        axios.get('/api/game/stages'),
        axios.get('/api/user/inventory')
      ]);
      
      setProgress(progressResponse.data);
      setStages(stagesResponse.data);
      setInventory(inventoryResponse.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStageData = () => {
    return stages[progress?.current_stage] || stages[1];
  };

  const getNextStageData = () => {
    const nextStageId = progress?.current_stage + 1;
    return stages[nextStageId];
  };

  const getXpProgress = () => {
    if (!progress) return 0;
    const xpNeeded = progress.level * 50;
    return Math.min((progress.xp / xpNeeded) * 100, 100);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your adventure...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const currentStage = getCurrentStageData();
  const nextStage = getNextStageData();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user.username}! 🎮</h1>
        <p>Ready to continue your MindCraft adventure?</p>
      </div>

      <div className="dashboard-grid">
        {/* Player Stats */}
        <div className="dashboard-card stats-card">
          <h3>🏆 Your Progress</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{progress?.level}</div>
              <div className="stat-label">Level</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{progress?.xp}</div>
              <div className="stat-label">XP</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{progress?.coins}</div>
              <div className="stat-label">Coins</div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div className="xp-progress">
            <div className="xp-bar">
              <div 
                className="xp-fill" 
                style={{ width: `${getXpProgress()}%` }}
              ></div>
            </div>
            <p className="xp-text">
              {progress?.xp} / {progress?.level * 50} XP to next level
            </p>
          </div>
        </div>

        {/* Current Stage */}
        <div className="dashboard-card current-stage">
          <h3>🗺️ Current Location</h3>
          <div className="stage-info">
            <div className="stage-emoji">{currentStage?.emoji}</div>
            <div className="stage-details">
              <h4>{currentStage?.name}</h4>
              <p>{currentStage?.theme}</p>
              <p className="stage-description">{currentStage?.description}</p>
            </div>
          </div>
          <Link to="/game" className="btn btn-primary">
            Continue Adventure
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/game" className="btn btn-primary action-btn">
              🎮 Play Game
            </Link>
            <Link to="/profile" className="btn btn-secondary action-btn">
              👤 View Profile
            </Link>
          </div>
        </div>

        {/* Inventory Preview */}
        <div className="dashboard-card inventory-preview">
          <h3>📦 Inventory</h3>
          <div className="inventory-items">
            {inventory && Object.entries(inventory.items).length > 0 ? (
              Object.entries(inventory.items).slice(0, 6).map(([item, quantity]) => (
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
              ))
            ) : (
              <p className="no-items">No items yet. Start playing to collect!</p>
            )}
          </div>
          {inventory && Object.entries(inventory.items).length > 6 && (
            <p className="more-items">+{Object.entries(inventory.items).length - 6} more items</p>
          )}
        </div>

        {/* Unlocked Stages */}
        <div className="dashboard-card unlocked-stages">
          <h3>🗺️ Unlocked Areas</h3>
          <div className="stages-list">
            {progress?.unlocked_areas?.map(stageId => {
              const stageData = stages[stageId];
              return stageData ? (
                <div key={stageId} className="stage-item">
                  <span className="stage-emoji">{stageData.emoji}</span>
                  <div className="stage-info">
                    <div className="stage-name">{stageData.name}</div>
                    <div className="stage-theme">{stageData.theme}</div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Next Stage Preview */}
        {nextStage && (
          <div className="dashboard-card next-stage">
            <h3>🔮 Next Adventure</h3>
            <div className="next-stage-info">
              <div className="stage-emoji">{nextStage.emoji}</div>
              <div className="stage-details">
                <h4>{nextStage.name}</h4>
                <p>{nextStage.theme}</p>
                <p className="unlock-requirement">
                  Unlock at {nextStage.xp_required} XP
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="dashboard-card achievements-card">
          <h3>🏆 Achievements</h3>
          <div className="achievements-list">
            {progress?.achievements && progress.achievements.length > 0 ? (
              progress.achievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <span className="achievement-icon">🏆</span>
                  <span className="achievement-text">{achievement}</span>
                </div>
              ))
            ) : (
              <p className="no-achievements">No achievements yet. Start playing to earn them!</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card recent-activity">
          <h3>📊 Recent Activity</h3>
          <div className="activity-item">
            <span className="activity-icon">🎮</span>
            <div className="activity-content">
              <div className="activity-title">Last Game Session</div>
              <div className="activity-time">
                {progress?.last_save ? 
                  new Date(progress.last_save).toLocaleDateString() : 
                  'No recent activity'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
