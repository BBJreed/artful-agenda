import React, { useState, useEffect } from 'react';
import { encryptedStorage } from '../services/encryptedStorage';
import { biometricAuth } from '../services/biometricAuth';

interface PrivacySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'data' | 'sharing' | 'security' | 'notifications';
}

const PrivacyDashboard: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      id: 'encryption',
      name: 'End-to-End Encryption',
      description: 'Encrypt all calendar data stored locally',
      enabled: true,
      category: 'security'
    },
    {
      id: 'biometric',
      name: 'Biometric Authentication',
      description: 'Require fingerprint or face recognition to access the app',
      enabled: false,
      category: 'security'
    },
    {
      id: 'location',
      name: 'Location Sharing',
      description: 'Allow location access for location-based events',
      enabled: true,
      category: 'sharing'
    },
    {
      id: 'contacts',
      name: 'Contact Sync',
      description: 'Sync contacts for easier event invitations',
      enabled: true,
      category: 'sharing'
    },
    {
      id: 'analytics',
      name: 'Usage Analytics',
      description: 'Share anonymous usage data to improve the app',
      enabled: false,
      category: 'data'
    },
    {
      id: 'notifications',
      name: 'Notification Tracking',
      description: 'Track notification interactions for better reminders',
      enabled: true,
      category: 'notifications'
    }
  ]);

  const [availableBiometricMethods, setAvailableBiometricMethods] = useState<Array<'fingerprint' | 'face' | 'iris'>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load available biometric methods
    setAvailableBiometricMethods(biometricAuth.getAvailableMethods());
    
    // Check authentication status
    setIsAuthenticated(biometricAuth.isAuthenticatedUser());
  }, []);

  const toggleSetting = (id: string) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleBiometricAuth = async (method: 'fingerprint' | 'face') => {
    try {
      let success = false;
      
      if (method === 'fingerprint') {
        success = await biometricAuth.authenticateWithFingerprint();
      } else if (method === 'face') {
        success = await biometricAuth.authenticateWithFace();
      }
      
      if (success) {
        setIsAuthenticated(true);
        // Enable biometric setting if authentication successful
        setSettings(prevSettings => 
          prevSettings.map(setting => 
            setting.id === 'biometric' ? { ...setting, enabled: true } : setting
          )
        );
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      alert('Biometric authentication failed. Please try again.');
    }
  };

  const handleLogout = () => {
    biometricAuth.logout();
    setIsAuthenticated(false);
    // Disable biometric setting on logout
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === 'biometric' ? { ...setting, enabled: false } : setting
      )
    );
  };

  const saveSettings = async () => {
    try {
      await encryptedStorage.storeEncryptedData('privacy-settings', settings);
      alert('Privacy settings saved successfully!');
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      alert('Failed to save privacy settings. Please try again.');
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await encryptedStorage.retrieveEncryptedData('privacy-settings');
      if (savedSettings) {
        setSettings(savedSettings);
        alert('Privacy settings loaded successfully!');
      } else {
        alert('No saved privacy settings found.');
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
      alert('Failed to load privacy settings. Please try again.');
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, PrivacySetting[]>);

  return (
    <div className="privacy-dashboard">
      <h2>Privacy Dashboard</h2>
      <p>Manage your privacy settings and data protection preferences</p>
      
      <div className="auth-status">
        <h3>Authentication Status</h3>
        <p>Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        {!isAuthenticated && availableBiometricMethods.length > 0 && (
          <div className="biometric-auth">
            <p>Authenticate with:</p>
            {availableBiometricMethods.includes('fingerprint') && (
              <button onClick={() => handleBiometricAuth('fingerprint')}>
                Fingerprint
              </button>
            )}
            {availableBiometricMethods.includes('face') && (
              <button onClick={() => handleBiometricAuth('face')}>
                Face Recognition
              </button>
            )}
          </div>
        )}
        {isAuthenticated && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
      
      <div className="settings-sections">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <div key={category} className="settings-category">
            <h3>
              {category.charAt(0).toUpperCase() + category.slice(1)} Settings
            </h3>
            {categorySettings.map(setting => (
              <div key={setting.id} className="setting-item">
                <div className="setting-info">
                  <h4>{setting.name}</h4>
                  <p>{setting.description}</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    onChange={() => toggleSetting(setting.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="actions">
        <button onClick={saveSettings}>Save Settings</button>
        <button onClick={loadSettings}>Load Settings</button>
      </div>
      

    </div>
  );
};

export default PrivacyDashboard;