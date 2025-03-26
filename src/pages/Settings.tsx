import { FC, useState } from 'react';

interface SettingsProps {
  darkMode: boolean;
}

const Settings: FC<SettingsProps> = ({ darkMode }) => {
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Backup states
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleBackupCreation = () => {
    // Add backup logic here
    console.log('Creating backup:', backupName);
    setShowBackupModal(false);
    setBackupName('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
      {/* Backup Creation Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96`}>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Create New Backup
            </h3>
            <input
              type="text"
              placeholder="Backup name"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              className={`w-full p-2 mb-4 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBackupModal(false)}
                className={`px-4 py-2 rounded ${
                  darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBackupCreation}
                className={`px-4 py-2 rounded ${
                  darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'
                } text-white`}
              >
                Create Backup
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Settings
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* System Preferences */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              System Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Language
                </label>
                <select 
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admin Settings */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Admin Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                />
              </div>
              <button
                className={`${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white px-4 py-2 rounded`}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Data Management */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Data Management
          </h2>
          
          <div className="space-y-8">
            {/* Notice Component */}
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              darkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
            }`}>
              <svg 
                className={`flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div>
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  Regular backups help protect your data. We recommend creating backups before 
                  making significant changes or periodically for safety
                </p>
              </div>
            </div>

            {/* Backup Section */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
              <h3 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Backup Database
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Create a backup of your database that you can restore later
              </p>
              <button
                onClick={() => setShowBackupModal(true)}
                className={`${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white px-4 py-2 rounded`}
              >
                Create Backup
              </button>
            </div>

            {/* Restore Section */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
              <h3 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Restore Database
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Restore your database from a previous backup
              </p>
              <div className="flex flex-col gap-4">
                <label className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer px-4 py-2 rounded text-center`}>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".backup"
                  />
                  <span className={`${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {selectedFile ? selectedFile.name : 'Choose Backup File'}
                  </span>
                </label>
                
                <button
                  disabled={!selectedFile}
                  className={`px-4 py-2 rounded ${
                    selectedFile 
                      ? `${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white`
                      : `${darkMode ? 'bg-gray-500' : 'bg-gray-300'} text-gray-400 cursor-not-allowed`
                  }`}
                >
                  Restore Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;