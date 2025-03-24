import { Routes, Route, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarVariants = {
    open: { width: 240 },
    closed: { width: 64 }
  };

  const navItemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };

  const routes = [
    { to: "/", text: "🏠 Dashboard" },
    { to: "/members", text: "👤 Members" },
    { to: "/subscriptions", text: "💳 Subscriptions" },
    { to: "/settings", text: "⚙ Settings" }
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Animated Sidebar */}
      <motion.aside
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gray-800 p-5 shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            animate={{ opacity: isSidebarOpen ? 1 : 0 }}
            className="text-xl font-bold overflow-hidden whitespace-nowrap"
          >
            GymProDesk
          </motion.h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-xl hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <FaBars />
          </button>
        </div>

        <nav>
          <ul className="space-y-2">
            {routes.map((item, index) => (
              <motion.li
                key={item.to}
                variants={navItemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block p-3 rounded transition-colors ${
                      isActive ? "bg-gray-700" : "hover:bg-gray-700"
                    }`
                  }
                >
                  <motion.div
                    className="flex items-center gap-3 overflow-hidden"
                    animate={{ paddingLeft: isSidebarOpen ? "1rem" : "0" }}
                  >
                    <span className="text-xl">{item.text.split(" ")[0]}</span>
                    <motion.span
                      className="whitespace-nowrap"
                      animate={{
                        width: isSidebarOpen ? "auto" : 0,
                        opacity: isSidebarOpen ? 1 : 0
                      }}
                    >
                      {item.text.split(" ")[1]}
                    </motion.span>
                  </motion.div>
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;