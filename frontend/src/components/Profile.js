import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [stages, setStages] = useState({});
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [profileResponse, progressResponse, stagesResponse, inventoryResponse] = await Promise.all([
        axios.get('/api/user/profile'),
        axios.get('/api/user/progress'),
        axios.get('/api/game/stages'),
        axios.get('/api/user/inventory')
      ]);
      
      setProfile(profileResponse.data);
      setProgress(progressResponse.data);
      setStages(stagesResponse.data);
      setInventory(inventoryResponse.data);
    } catch (error) {
      setError('Failed to load user data');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getXpProgress = () => {
    if (!progress) return 0;
    const xpNeeded = progress.level * 50;
    return Math.min((progress.xp / xpNeeded) * 100, 100);
  };

  const getCurrentStageData = () => {
    return stages[progress?.current_stage] || stages[1];
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const currentStage = getCurrentStageData();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 Player Profile</h1>
        <p>Manage your account and view your MindCraft progress</p>
      </div>

      <div className="profile-grid">
        

        {/* Current Stage */}
        <div className="profile-card current-stage">
          <h3>🗺️ Current Location</h3>
          <div className="stage-display">
            <div className="stage-emoji">{currentStage?.emoji}</div>
            <div className="stage-details">
              <h4>{currentStage?.name}</h4>
              <p className="stage-theme">{currentStage?.theme}</p>
              <p className="stage-description">{currentStage?.description}</p>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="profile-card inventory">
          <h3>📦 Inventory</h3>
          <div className="inventory-grid">
            {inventory && Object.entries(inventory.items).length > 0 ? (
              Object.entries(inventory.items).map(([item, quantity]) => {
                const getItemIcon = (itemName) => {
                  switch (itemName.toLowerCase()) {
                    case 'diamond': return '💎';
                    case 'stone': return '🪨';
                    case 'wood': return '🪵';
                    default: return '📦';
                  }
                };
                
                return (
                  <div key={item} className="inventory-item">
                    <span className="item-icon">{getItemIcon(item)}</span>
                    <span className="item-name">{item}</span>
                    <span className="item-quantity">x{quantity}</span>
                  </div>
                );
              })
            ) : (
              <p className="no-items">No items collected yet. Start playing to gather resources!</p>
            )}
          </div>
        </div>

        {/* Unlocked Stages */}
        <div className="profile-card unlocked-stages">
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

        {/* Achievements */}
        <div className="profile-card achievements">
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
              <div className="no-achievements">
                <p>No achievements yet. Keep playing to earn them!</p>
                <button 
                  onClick={() => navigate('/game')} 
                  className="btn btn-primary"
                >
                  Start Playing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="profile-card recent-activity">
          <h3>📊 Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🎮</div>
              <div className="activity-content">
                <div className="activity-title">Last Game Session</div>
                <div className="activity-time">
                  {progress?.last_save ? 
                    new Date(progress.last_save).toLocaleString() : 
                    'No recent activity'
                  }
                </div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💾</div>
              <div className="activity-content">
                <div className="activity-title">Last Save</div>
                <div className="activity-time">
                  {inventory?.last_updated ? 
                    new Date(inventory.last_updated).toLocaleString() : 
                    'Never'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button 
          onClick={() => navigate('/game')} 
          className="btn btn-primary"
        >
          🎮 Play Game
        </button>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-secondary"
        >
          📊 Dashboard
        </button>
      </div>
    </div>
  );
};

export default Profile;
