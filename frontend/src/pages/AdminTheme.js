import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSettings, updateAdminSettings } from '../utils/api';
import '../styles/AdminTheme.css';

function AdminTheme() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    appTheme: {},
    layout: {},
    sounds: {},
    notifications: {}
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getAdminSettings();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleColorChange = (colorKey, value) => {
    setSettings({
      ...settings,
      appTheme: { ...settings.appTheme, [colorKey]: value }
    });
  };

  const handleSave = async () => {
    try {
      await updateAdminSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-theme-container">
      <header className="admin-header">
        <h1>🎨 App Customization</h1>
        <button className="button button-secondary" onClick={() => navigate('/admin')}>
          Back
        </button>
      </header>

      {saved && <div className="success-message">✓ Settings saved successfully!</div>}

      <div className="settings-section">
        <h2>Colors</h2>
        <div className="color-grid">
          <div className="color-input">
            <label>Primary Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={settings.appTheme.primaryColor || '#667eea'}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              />
              <span className="color-value">{settings.appTheme.primaryColor || '#667eea'}</span>
            </div>
          </div>

          <div className="color-input">
            <label>Secondary Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={settings.appTheme.secondaryColor || '#ec4899'}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
              />
              <span className="color-value">{settings.appTheme.secondaryColor || '#ec4899'}</span>
            </div>
          </div>

          <div className="color-input">
            <label>Text Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={settings.appTheme.textColor || '#1e293b'}
                onChange={(e) => handleColorChange('textColor', e.target.value)}
              />
              <span className="color-value">{settings.appTheme.textColor || '#1e293b'}</span>
            </div>
          </div>

          <div className="color-input">
            <label>Background Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={settings.appTheme.backgroundColor || '#f8fafc'}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              />
              <span className="color-value">{settings.appTheme.backgroundColor || '#f8fafc'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Sound Settings</h2>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.sounds?.enabled || false}
            onChange={(e) => setSettings({
              ...settings,
              sounds: { ...settings.sounds, enabled: e.target.checked }
            })}
          />
          Enable Sounds
        </label>
      </div>

      <div className="settings-section">
        <h2>Notifications</h2>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.notifications?.whatsappEnabled || false}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, whatsappEnabled: e.target.checked }
            })}
          />
          Enable WhatsApp Notifications
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.notifications?.inAppEnabled || false}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, inAppEnabled: e.target.checked }
            })}
          />
          Enable In-App Notifications
        </label>
      </div>

      <button className="button button-primary button-large" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}

export default AdminTheme;
