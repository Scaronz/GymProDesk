import { PageProps } from '../types';

const Subscriptions: React.FC<PageProps> = ({ darkMode }) => {
  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
      {/* Subscriptions content */}
    </div>
  );
};

export default Subscriptions;