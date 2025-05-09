import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isActive = (path) => location.pathname === path;
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/attendance', label: 'Attendance', icon: '📝', roles: ['teacher'] },
    { path: '/reports', label: 'Reports', icon: '📈', roles: ['teacher', 'admin'] },
    { path: '/students', label: 'Students', icon: '👥', roles: ['admin'] },
    { path: '/teachers', label: 'Teachers', icon: '🧑‍🏫', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );
  return (
    <>
      {/* Mobile menu button */}
      {isMobileView && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-md"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      )}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
          isMobileView
            ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
            : 'translate-x-0'
        }`}
        style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex', /* Enable flexbox for the sidebar */
          flexDirection: 'column', /* Stack header, content, and footer vertically */
        }}
      >
        {/* Header - fixed position */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800 truncate">Attendance System</h2>
          <p className="text-sm text-gray-600 mt-1 truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-500 capitalize truncate">{user?.role || 'role'}</p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobileView && setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        {/* Fixed footer with logout button - always visible */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className=" cursor-pointer w-full flex items-center space-x-3 p-3 rounded-lg text-blue-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg ">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {/* Overlay */}
      {isMobileMenuOpen && isMobileView && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
export default Sidebar;