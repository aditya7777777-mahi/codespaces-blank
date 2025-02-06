import { useState, useEffect } from 'react';
import api from '../utils/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    closed: 0,
    customers: 0,
    categories: {},
    priorities: {}
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ticketsResponse, customersResponse] = await Promise.all([
        api.get('/tickets'),
        api.get('/customers')
      ]);
      
      const tickets = ticketsResponse.data;
      
      const newStats = {
        total: tickets.length,
        active: tickets.filter(t => t.status === 'Active').length,
        pending: tickets.filter(t => t.status === 'Pending').length,
        closed: tickets.filter(t => t.status === 'Closed').length,
        customers: customersResponse.data.length,
        categories: {},
        priorities: {}
      };

      // Calculate category and priority distributions
      tickets.forEach(ticket => {
        newStats.categories[ticket.category] = (newStats.categories[ticket.category] || 0) + 1;
        newStats.priorities[ticket.priority] = (newStats.priorities[ticket.priority] || 0) + 1;
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Total Tickets</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Active Tickets</h3>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Pending Tickets</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Closed Tickets</h3>
          <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Total Customers</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.customers}</p>
        </div>
      </div>

      {/* Category and Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span>{category}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Priorities</h3>
          <div className="space-y-2">
            {Object.entries(stats.priorities).map(([priority, count]) => (
              <div key={priority} className="flex justify-between items-center">
                <span>{priority}</span>
                <span className={`px-2 py-1 rounded ${
                  priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                  priority === 'High' ? 'bg-orange-100 text-orange-800' :
                  priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
