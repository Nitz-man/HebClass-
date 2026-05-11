import React, { useState } from 'react';
import { loginUser } from '../utils/api';
import '../styles/LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(username, password);
      onLogin(data.user, data.token);
    } catch (err) {
      setError('Connection error. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (user) => {
    setUsername(user);
    setPassword('password123');
  };

  return (
    <div className="login-container">
      <div className="login-box fade-in">
        <div className="login-header">
          <h1>🎮 Kids Learning App</h1>
          <p>Have fun while learning!</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="button button-primary button-large"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="quick-login">
          <p>Quick Login (Demo Users):</p>
          <div className="quick-buttons">
            {['itay', 'tal', 'leo', 'ariel', 'dean', 'ellie'].map(user => (
              <button
                key={user}
                className="button-quick"
                onClick={() => quickLogin(user)}
              >
                {user}
              </button>
            ))}
          </div>
          <p className="small-text">Password for all users: password123</p>
        </div>

        <div className="info-box">
          <h3>ℹ️ Demo Information</h3>
          <p><strong>Default Users:</strong> itay, tal, leo, ariel, dean, ellie</p>
          <p><strong>Password:</strong> password123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
