import { FC } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, TooltipItem } from 'chart.js'; // Added ChartOptions, TooltipItem
import { Pie } from 'react-chartjs-2';

// Register Chart.js components needed for Pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

interface StatisticsProps {
  darkMode: boolean;
}

// Define an interface for the stats data structure for better type safety
interface GymStats {
  totalMembers: number;
  genderRatio: { male: number; female: number };
  averageAge: number;
  activeRate: number;
  genderDistribution: { male: number; female: number };
  ageDistribution: {
    under18: number;
    eighteenTo24: number;
    twentyFiveTo34: number;
    thirtyFiveTo44: number;
    fortyFivePlus: number;
    unspecified: number;
  };
}

const Statistics: FC<StatisticsProps> = ({ darkMode }) => {
  // Mock data - replace with real data from your backend/localStorage
  const stats: GymStats = { // Use the GymStats interface
    totalMembers: 17,
    genderRatio: { male: 53, female: 47 }, // Note: this seems percentage based, might need raw counts later
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

  // --- Prepare Data for Age Distribution Pie Chart ---
  const ageChartData = {
    labels: [
      'Under 18',
      '18-24',
      '25-34',
      '35-44',
      '45+',
      'Unspecified',
    ],
    datasets: [
      {
        label: '# of Members',
        data: [
          stats.ageDistribution.under18,
          stats.ageDistribution.eighteenTo24,
          stats.ageDistribution.twentyFiveTo34,
          stats.ageDistribution.thirtyFiveTo44,
          stats.ageDistribution.fortyFivePlus,
          stats.ageDistribution.unspecified,
        ],
        backgroundColor: [ // Example colors, adjust as needed
          'rgba(54, 162, 235, 0.7)',  // Blue
          'rgba(75, 192, 192, 0.7)',  // Teal
          'rgba(255, 206, 86, 0.7)',  // Yellow
          'rgba(255, 159, 64, 0.7)',  // Orange
          'rgba(153, 102, 255, 0.7)', // Purple
          'rgba(201, 203, 207, 0.7)'  // Gray
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // --- Define Options for Age Distribution Pie Chart ---
  const chartOptions: ChartOptions<'pie'> = { // Use ChartOptions<'pie'> for specific options
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const, // Use 'as const' for literal type
        labels: {
          color: darkMode ? '#FFFFFF' : '#374151', // Adjust text color for dark mode
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) { // Use TooltipItem<'pie'>
              let label = context.label || '';
              if (label) {
                  label += ': ';
              }
              if (context.parsed !== null) {
                  const total = context.dataset.data.reduce((acc: number, value: number) => acc + value, 0);
                  const value = context.parsed;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  label += `${value} (${percentage}%)`;
              }
              return label;
          }
        }
      },
    },
  };


  // --- Prepare Data for Gender Distribution Pie Chart (Example) ---
  // You might want a separate chart for gender too
  const genderChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: '# of Members',
        data: [stats.genderDistribution.male, stats.genderDistribution.female],
        backgroundColor: [
            'rgba(54, 162, 235, 0.7)', // Blue for Male
            'rgba(255, 99, 132, 0.7)', // Pink for Female
        ],
        borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  // Use the same chartOptions or define specific ones for gender


  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}> {/* Adjusted outer bg */}
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
          value={stats.totalMembers.toString()} // Ensure value is string for StatCard
          bgColor="bg-blue-100"
          darkBgColor="dark:bg-blue-900" // Prefix dark mode classes
        />
        <StatCard
          darkMode={darkMode}
          // Using raw counts from genderDistribution for a potentially more accurate card title
          title="Gender Distribution"
          value={`${stats.genderDistribution.male} Male / ${stats.genderDistribution.female} Female`}
          bgColor="bg-purple-100"
          darkBgColor="dark:bg-purple-900"
        />
        <StatCard
          darkMode={darkMode}
          title="Average Age"
          value={`${stats.averageAge} years`}
          bgColor="bg-green-100"
          darkBgColor="dark:bg-green-900"
        />
        <StatCard
          darkMode={darkMode}
          title="Active Rate"
          value={`${stats.activeRate}% active`}
          bgColor="bg-yellow-100"
          darkBgColor="dark:bg-yellow-900"
        />
      </div>

      {/* Combined Chart Section (Example using Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

          {/* Gender Distribution Section */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Gender Distribution
            </h2>
            {/* Container for sizing the chart */}
            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
              <Pie data={genderChartData} options={chartOptions} /> {/* Use gender data */}
            </div>
          </div>


          {/* Age Distribution Section */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Age Distribution
            </h2>
            {/* Container for sizing the chart */}
            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
              <Pie data={ageChartData} options={chartOptions} /> {/* Use age data */}
            </div>
          </div>
      </div>


      {/* Check-in Pattern Section */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Weekly Check-in Pattern
        </h2>
        <div className={`h-48 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} flex items-center justify-center`}>
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Check-in chart visualization placeholder (e.g., Bar or Line chart)
          </span>
          {/* You would use react-chartjs-2's Bar or Line component here later */}
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---

// Reusable Stat Card Component (Added type safety)
interface StatCardProps {
  darkMode: boolean;
  title: string;
  value: string; // Ensure value is always passed as string
  bgColor: string;
  darkBgColor: string;
}
const StatCard: FC<StatCardProps> = ({ darkMode, title, value, bgColor, darkBgColor }) => (
  // Use dark: prefix for Tailwind dark mode variants
  <div className={`p-4 rounded-lg ${bgColor} ${darkBgColor}`}>
    <h3 className={`text-sm font-medium text-gray-600 dark:text-gray-300`}>{title}</h3>
    <p className={`text-2xl font-bold text-gray-900 dark:text-white`}>{value}</p>
  </div>
);

// Gender Distribution Component (Kept for potential future use, but not used by Pie charts)
/* // If you decide you need the pill display elsewhere, keep this
interface GenderPillProps {
    darkMode: boolean;
    gender: 'Male' | 'Female';
    count: number;
    total: number;
}
const GenderPill: FC<GenderPillProps> = ({ darkMode, gender, count, total }) => {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
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
*/

// Age Group Component is no longer needed as it's replaced by the Pie chart.
// const AgeGroup = ({ darkMode, label, count }: any) => ( ... );

export default Statistics;