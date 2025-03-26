// pages/Dashboard.tsx
import { PageProps } from '../types';

const Dashboard: React.FC<PageProps> = ({ darkMode }) => {
  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
};

export default Dashboard;