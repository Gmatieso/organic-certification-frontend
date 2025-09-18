import React from 'react';
import { 
  Sprout, 
  ClipboardCheck, 
  Award, 
  Users, 
  TrendingUp,
  Calendar,
  Bell,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const metrics = [
    { name: 'Total Farms', value: '342', change: '+12%', icon: Sprout, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Inspections Pending', value: '28', change: '-5%', icon: ClipboardCheck, color: 'from-blue-500 to-blue-600' },
    { name: 'Active Certificates', value: '298', change: '+8%', icon: Award, color: 'from-amber-500 to-amber-600' },
    { name: 'Registered Farmers', value: '156', change: '+15%', icon: Users, color: 'from-purple-500 to-purple-600' },
  ];

  const monthlyData = [
    { month: 'Jan', inspections: 65, certificates: 52 },
    { month: 'Feb', inspections: 72, certificates: 68 },
    { month: 'Mar', inspections: 68, certificates: 61 },
    { month: 'Apr', inspections: 85, certificates: 74 },
    { month: 'May', inspections: 78, certificates: 69 },
    { month: 'Jun', inspections: 92, certificates: 85 },
  ];

  const certificateStatus = [
    { name: 'Valid', value: 248, color: '#10B981' },
    { name: 'Expiring Soon', value: 32, color: '#F59E0B' },
    { name: 'Expired', value: 18, color: '#EF4444' },
  ];

  const notifications = [
    { id: 1, message: '15 certificates expiring in next 30 days', type: 'warning', time: '2 hours ago' },
    { id: 2, message: 'New farm registration from John Doe', type: 'info', time: '4 hours ago' },
    { id: 3, message: 'Inspection completed for Green Valley Farm', type: 'success', time: '1 day ago' },
    { id: 4, message: '3 inspections overdue', type: 'error', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100">Here's what's happening with your organic certification program today.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`bg-gradient-to-r ${metric.color} p-3 rounded-lg`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <span className={`ml-2 text-sm font-medium ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="inspections" fill="#3B82F6" name="Inspections" radius={[4, 4, 0, 0]} />
              <Bar dataKey="certificates" fill="#10B981" name="Certificates" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Certificate Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={certificateStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {certificateStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {certificateStatus.map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-600">{item.name}: </span>
                <span className="font-semibold text-gray-900 ml-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div key={notification.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <div className={`p-1 rounded-full mr-3 mt-1 ${
                  notification.type === 'warning' ? 'bg-amber-100' :
                  notification.type === 'error' ? 'bg-red-100' :
                  notification.type === 'success' ? 'bg-emerald-100' : 'bg-blue-100'
                }`}>
                  <AlertCircle className={`h-3 w-3 ${
                    notification.type === 'warning' ? 'text-amber-600' :
                    notification.type === 'error' ? 'text-red-600' :
                    notification.type === 'success' ? 'text-emerald-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;