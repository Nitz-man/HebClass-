import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPortal.css';

function AdminPortal() {
  const navigate = useNavigate();

  const adminPages = [
    {
      id: 1,
      title: 'App Customization',
      description: 'Control colors, sizes, music',
      icon: '🎨',
      path: '/admin/theme',
      color: 'theme'
    },
    {
      id: 2,
      title: 'Word Bank',
      description: 'Add and manage words',
      icon: '📚',
      path: '/admin/words',
      color: 'words'
    },
    {
      id: 3,
      title: 'User Analytics',
      description: 'Track user activity',
      icon: '📊',
      path: '/admin/analytics',
      color: 'analytics'
    }
  ];

  return (
    <div className="admin-container">
      <header className="admin-header fade-in">
        <h1>⚙️ Admin Portal</h1>
        <button className="button button-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </header>

      <div className="admin-grid">
        {adminPages.map((page, index) => (
          <button
            key={page.id}
            className={`admin-button ${page.color}`}
            onClick={() => navigate(page.path)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="admin-icon">{page.icon}</div>
            <div className="admin-title">{page.title}</div>
            <div className="admin-description">{page.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminPortal;
