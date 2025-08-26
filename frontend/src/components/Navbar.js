import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>MindCraft</h1>
        </Link>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/game" className="nav-link">Play Game</Link>
              <Link to="/catalog" className="nav-link">🎴 Characters</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <div className="user-info">
                <span>Welcome, {user.username}!</span>
                <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
