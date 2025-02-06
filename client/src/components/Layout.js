import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { text: 'Tickets', icon: '🎫', path: '/' },
    ...(user?.role && user.role !== 'customer' ? [{ text: 'Customers', icon: '👥', path: '/customers' }] : []),
    ...(user?.role === 'admin' ? [{ text: 'Dashboard', icon: '📊', path: '/dashboard' }] : [])
  ];

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 bg-gray-900">
          <h1 className="text-xl font-bold">Helpdesk</h1>
        </div>
        
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.text}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center gap-3"
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={logout}
          className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center gap-3 mt-auto"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.name}
          </h2>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
