import { FC } from 'react';

interface StatisticsProps {
  darkMode: boolean;
}

const Statistics: FC<StatisticsProps> = ({ darkMode }) => {
  // Mock data - replace with real data from your backend/localStorage
  const stats = {
    totalMembers: 17,
    genderRatio: { male: 53, female: 47 },
    averageAge: 22,
    activeRate: 100,
    genderDistribution: { male: 9, female: 8 },
    ageDistribution: {
      under18: 12,
      eighteenTo24: 6,
      twentyFiveTo34: 4,
      thirtyFiveTo44: 0,
      fortyFivePlus: 0,
      unspecified: 0
    }
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Analytics & Reports
      </h1>
      <p className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Comprehensive overview of your gym’s performance and member statistics
      </p>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          darkMode={darkMode}
          title="Total Members"
          value={stats.totalMembers}
          bgColor="bg-blue-100"
          darkBgColor="bg-blue-900"
        />
        <StatCard 
          darkMode={darkMode}
          title="Gender Ratio"
          value={`${stats.genderRatio.male}% male`}
          bgColor="bg-purple-100"
          darkBgColor="bg-purple-900"
        />
        <StatCard 
          darkMode={darkMode}
          title="Average Age"
          value={`${stats.averageAge} years`}
          bgColor="bg-green-100"
          darkBgColor="bg-green-900"
        />
        <StatCard 
          darkMode={darkMode}
          title="Active Rate"
          value={`${stats.activeRate}% active`}
          bgColor="bg-yellow-100"
          darkBgColor="bg-yellow-900"
        />
      </div>

      {/* Gender Distribution Section */}
      <div className={`mb-8 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Gender Distribution
        </h2>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Breakdown of member gender demographics
        </p>
        <div className="flex gap-4">
          <GenderPill 
            darkMode={darkMode}
            gender="Male"
            count={stats.genderDistribution.male}
            total={stats.totalMembers}
          />
          <GenderPill 
            darkMode={darkMode}
            gender="Female"
            count={stats.genderDistribution.female}
            total={stats.totalMembers}
          />
        </div>
      </div>

      {/* Age Distribution Section */}
      <div className={`mb-8 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Age Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AgeGroup 
            darkMode={darkMode}
            label="Under 18"
            count={stats.ageDistribution.under18}
          />
          <AgeGroup 
            darkMode={darkMode}
            label="18-24"
            count={stats.ageDistribution.eighteenTo24}
          />
          <AgeGroup 
            darkMode={darkMode}
            label="25-34"
            count={stats.ageDistribution.twentyFiveTo34}
          />
          <AgeGroup 
            darkMode={darkMode}
            label="35-44"
            count={stats.ageDistribution.thirtyFiveTo44}
          />
          <AgeGroup 
            darkMode={darkMode}
            label="45+"
            count={stats.ageDistribution.fortyFivePlus}
          />
          <AgeGroup 
            darkMode={darkMode}
            label="Unspecified"
            count={stats.ageDistribution.unspecified}
          />
        </div>
      </div>

      {/* Check-in Pattern Section */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Weekly Check-in Pattern
        </h2>
        <div className={`h-48 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} flex items-center justify-center`}>
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Check-in chart visualization placeholder
          </span>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ darkMode, title, value, bgColor, darkBgColor }: any) => (
  <div className={`p-4 rounded-lg ${darkMode ? darkBgColor : bgColor}`}>
    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{title}</h3>
    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
  </div>
);

// Gender Distribution Component
const GenderPill = ({ darkMode, gender, count, total }: any) => {
  const percentage = ((count / total) * 100).toFixed(1);
  return (
    <div className={`flex-1 p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{gender}</span>
        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count}</span>
      </div>
      <div className={`w-full bg-opacity-20 rounded-full h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-300'}`}>
        <div 
          className={`h-2 rounded-full ${gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Age Group Component
const AgeGroup = ({ darkMode, label, count }: any) => (
  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
    <h4 className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</h4>
    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count}</p>
  </div>
);

export default Statistics;