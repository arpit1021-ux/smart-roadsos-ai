import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/report', label: 'Report Accident', icon: '🚨' },
    { path: '/contacts', label: 'Emergency Contacts', icon: '👥' },
    { path: '/history', label: 'History', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 dark:bg-red-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚑</span>
            <h1 className="text-xl font-bold">Smart RoadSos AI</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-red-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-sm hidden md:block">{user?.username}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block">
          <ul className="py-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-900 border-r-4 border-red-600 text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`
                  }
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 text-xs ${
                  isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                }`
              }
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
