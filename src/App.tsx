import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";


function App() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-5 shadow-lg">
        <h1 className="text-xl font-bold mb-5">Gym Dashboard</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block p-3 bg-gray-700 rounded hover:bg-gray-600">
                🏠 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/members" className="block p-3 hover:bg-gray-700 rounded">
                👤 Members
              </Link>
            </li>
            <li>
              <Link to="/subscriptions" className="block p-3 hover:bg-gray-700 rounded">
                💳 Subscriptions
              </Link>
            </li>
            <li>
              <Link to="/settings" className="block p-3 hover:bg-gray-700 rounded">
                ⚙ Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
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
