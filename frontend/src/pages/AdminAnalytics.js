import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics, sendWhatsAppNotification } from '../utils/api';
import '../styles/AdminAnalytics.css';

function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const handleSendNotification = async (userId) => {
    try {
      const user = analytics.find(u => u.id === userId);
      const message = `Hi! Your child ${user.fullName} has reached level ${user.level}! Great job! 🎉`;
      
      await sendWhatsAppNotification(userId, message);
      
      alert('Notification sent!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const totalUsers = analytics.length;
  const averageLevel = analytics.reduce((acc, user) => acc + user.level, 0) / totalUsers;
  const totalGamesPlayed = analytics.reduce((acc, user) => acc + user.gamesPlayed, 0);
  const totalTimeSpent = analytics.reduce((acc, user) => acc + user.totalTime, 0);

  return (
    <div className="admin-analytics-container">
      <header className="admin-header">
        <h1>📊 User Analytics</h1>
        <button className="button button-secondary" onClick={() => navigate('/admin')}>
          Back
        </button>
      </header>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Level</div>
          <div className="stat-value">{averageLevel.toFixed(1)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Games</div>
          <div className="stat-value">{totalGamesPlayed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Time (hrs)</div>
          <div className="stat-value">{(totalTimeSpent / 3600).toFixed(1)}</div>
        </div>
      </div>

      <div className="analytics-section">
        <h2>User Activity Details</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User Name</th>
                <th>Level</th>
                <th>Score</th>
                <th>Games Played</th>
                <th>Time (min)</th>
                <th>Wrong Answers</th>
                <th>Last Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map(user => (
                <tr key={user.id}>
                  <td className="user-name">{user.fullName}</td>
                  <td>
                    <span className="level-badge">LV {user.level}</span>
                  </td>
                  <td className="score">{user.score}</td>
                  <td>{user.gamesPlayed}</td>
                  <td>{Math.round(user.totalTime / 60)}</td>
                  <td>{user.wrongAnswers}</td>
                  <td>
                    {user.lastActive 
                      ? new Date(user.lastActive).toLocaleDateString() 
                      : 'Never'}
                  </td>
                  <td>
                    <button 
                      className="button-small"
                      onClick={() => handleSendNotification(user.id)}
                      title="Send WhatsApp notification"
                    >
                      📲
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-section">
        <h2>User Progress Chart</h2>
        <div className="progress-bars">
          {analytics.map(user => (
            <div key={user.id} className="progress-row">
              <span className="user-label">{user.fullName}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${(user.score / 500) * 100}%`}}
                >
                  <span className="progress-text">{user.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
