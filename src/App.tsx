import { motion } from "framer-motion";
import { useState } from 'react';
import { FiUsers, FiCreditCard, FiSettings, FiMoon, FiSun, FiHome } from 'react-icons/fi';
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";
import { FaBars } from "react-icons/fa";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  component: React.ReactElement;
}

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const sidebarVariants = {
    open: { width: 256 },
    closed: { width: 76 }
  };

  const textVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };

  const navItems: NavItem[] = [
    { 
      id: 'dashboard', 
      icon: <FiHome />, 
      label: 'Dashboard', 
      component: <Dashboard darkMode={darkMode} /> 
    },
    { 
      id: 'members', 
      icon: <FiUsers />, 
      label: 'Members', 
      component: <Members darkMode={darkMode} /> 
    },
    { 
      id: 'subscriptions', 
      icon: <FiCreditCard />, 
      label: 'Subscriptions', 
      component: <Subscriptions darkMode={darkMode} /> 
    },
    { 
      id: 'settings', 
      icon: <FiSettings />, 
      label: 'Settings', 
      component: <Settings darkMode={darkMode} /> 
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated Sidebar */}
      <motion.div
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg z-10 flex flex-col`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <motion.h1
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              className="text-2xl font-bold whitespace-nowrap overflow-hidden"
            >
              GymProDesk
            </motion.h1>
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: isSidebarOpen ? 0 : 180 }}
            >
              <FaBars className="text-xl" />
            </motion.button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={textVariants}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                    activeTab === item.id 
                      ? (darkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-600') 
                      : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <motion.span
                    className="whitespace-nowrap"
                    animate={{
                      opacity: isSidebarOpen ? 1 : 0,
                      width: isSidebarOpen ? "auto" : 0
                    }}
                  >
                    {item.label}
                  </motion.span>
                </button>
              </motion.div>
            ))}
          </nav>

          {/* Dark Mode Toggle - Fixed Bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <FiSun className="text-xl mr-3" />
              ) : (
                <FiMoon className="text-xl mr-3" />
              )}
              <motion.span
                className="whitespace-nowrap"
                animate={{
                  opacity: isSidebarOpen ? 1 : 0,
                  width: isSidebarOpen ? "auto" : 0
                }}
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        } p-8`}
      >
        {navItems.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default App;