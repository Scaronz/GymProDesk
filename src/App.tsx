import { motion } from "framer-motion";
import { useState } from 'react';
import { FiUsers, FiCreditCard, FiSettings, FiMoon, FiSun, FiHome ,FiActivity } from 'react-icons/fi';
// Assuming these page components exist:
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Subscriptions from "./pages/Subscriptions";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import { FaBars } from "react-icons/fa";

// --- Placeholder Components (Remove or replace with your actual pages) ---
const PlaceholderComponent: React.FC<{ name: string; darkMode: boolean }> = ({ name, darkMode }) => (
  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
    <h2 className="text-2xl font-semibold mb-4">{name} Page</h2>
    <p>Content for {name} goes here.</p>
    <p>Dark Mode is: {darkMode ? 'On' : 'Off'}</p>
  </div>
);
// Use placeholders if actual pages aren't defined
const DashboardComponent = Dashboard || ((props: { darkMode: boolean }) => <PlaceholderComponent name="Dashboard" {...props} />);
const MembersComponent = Members || ((props: { darkMode: boolean }) => <PlaceholderComponent name="Members" {...props} />);
const SubscriptionsComponent = Subscriptions || ((props: { darkMode: boolean }) => <PlaceholderComponent name="Subscriptions" {...props} />);
const StatisticsComponent = Statistics || ((props: { darkMode: boolean }) => <PlaceholderComponent name="Statistics" {...props} />);
const SettingsComponent = Settings || ((props: { darkMode: boolean }) => <PlaceholderComponent name="Settings" {...props} />);
// --- End Placeholder Components ---


interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  component: React.ReactElement;
}

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const sidebarWidthOpen = 256;
  const sidebarWidthClosed = 76; // Fits icons (approx 24px) + padding (p-3 = 12px * 2 = 24px) + some buffer

  const sidebarVariants = {
    open: { width: sidebarWidthOpen },
    closed: { width: sidebarWidthClosed }
  };

  // Define navigation structure
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      icon: <FiHome className="text-xl" />,
      label: 'Dashboard',
      component: <DashboardComponent darkMode={darkMode} />
    },
    {
      id: 'members',
      icon: <FiUsers className="text-xl" />,
      label: 'Members',
      component: <MembersComponent darkMode={darkMode} />
    },
    {
      id: 'subscriptions',
      icon: <FiCreditCard className="text-xl" />,
      label: 'Subscriptions',
      component: <SubscriptionsComponent darkMode={darkMode} />
    },
    {
      id: 'statistics',
      icon: <FiActivity className="text-xl" />,
      label: 'Statistics',
      component: <StatisticsComponent darkMode={darkMode} />
    },
    {
      id: 'settings',
      icon: <FiSettings className="text-xl" />,
      label: 'Settings',
      component: <SettingsComponent darkMode={darkMode} />
    }
  ];

  return (
    // Main layout container using Flexbox
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>

      {/* Animated Sidebar */}
      <motion.div
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        // Use bg-white/bg-gray-800 for theme consistency
        className={`fixed left-0 top-0 h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg z-10 flex flex-col`}
        // Hide content overflow during width animation
        style={{ overflow: 'hidden' }}
      >
        {/* Inner container for padding and flex layout */}
        <div className="flex flex-col h-full p-4">

          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8 h-8">
            {/* Title animates opacity */}
            <motion.h1
              initial={false}
              animate={{ opacity: isSidebarOpen ? 1 : 0, transition: { duration: 0.1 } }}
              className="text-2xl font-bold whitespace-nowrap overflow-hidden"
            >
              GymProDesk
            </motion.h1>

            {/* Sidebar Toggle Button */}
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBars className="text-xl" />
            </motion.button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 flex-1 overflow-y-auto"> {/* flex-1 takes available space, overflow-y allows scrolling */}
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                // No conditional justify-center needed; rely on padding & fixed width when closed
                className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
                  activeTab === item.id
                    ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 font-medium')
                    : (darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200')
                }`}
                title={isSidebarOpen ? '' : item.label} // Show tooltip only when sidebar is collapsed
              >
                {/* Icon: Margin adjusts based on sidebar state */}
                <span className={`flex-shrink-0 ${isSidebarOpen ? 'mr-3' : 'm-0'}`}>
                  {item.icon}
                </span>

                {/* Label: Animates width, opacity, and marginLeft for smooth hide/show */}
                <motion.span
                  className="whitespace-nowrap overflow-hidden"
                  initial={false} // Prevent animation on initial load if sidebar starts open
                  animate={{
                    opacity: isSidebarOpen ? 1 : 0,
                    width: isSidebarOpen ? "auto" : 0,
                    // Animate left margin to match icon's right margin ONLY when open
                    marginLeft: isSidebarOpen ? '0.75rem' : 0, // 0.75rem = Tailwind's mr-3
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {item.label}
                </motion.span>
              </button>
            ))}
          </nav>

          {/* Dark Mode Toggle */}
          <div className="mt-auto pt-4 border-t border-gray-700 dark:border-gray-600">
            <button
              onClick={() => setDarkMode(!darkMode)}
              // No conditional justify-center needed
              className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title={isSidebarOpen ? '' : (darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')} // Tooltip when collapsed
            >
              {/* Icon: Margin adjusts */}
              <span className={`flex-shrink-0 ${isSidebarOpen ? 'mr-3' : 'm-0'}`}>
                {darkMode ? (
                  <FiSun className="text-xl" />
                ) : (
                  <FiMoon className="text-xl" />
                )}
              </span>
              {/* Label: Animates the same way as nav items */}
              <motion.span
                 className="whitespace-nowrap overflow-hidden"
                 initial={false}
                 animate={{
                   opacity: isSidebarOpen ? 1 : 0,
                   width: isSidebarOpen ? "auto" : 0,
                   marginLeft: isSidebarOpen ? '0.75rem' : 0,
                 }}
                 transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {/* Animate marginLeft to match sidebar width for smooth transition */}
      <motion.main
        className="flex-1 p-6 sm:p-8 overflow-y-auto" // flex-1 takes remaining space, allows scrolling
        initial={false}
        animate={{ marginLeft: isSidebarOpen ? sidebarWidthOpen : sidebarWidthClosed }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }} // Matches sidebar animation
      >
        {/* Render the active page component */}
        {navItems.find(tab => tab.id === activeTab)?.component}
      </motion.main>
    </div>
  );
};

export default App;