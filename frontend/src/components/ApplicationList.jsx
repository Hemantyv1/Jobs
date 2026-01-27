import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ApplicationList({ onEdit, onView }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      alert('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return;

    try {
      await api.deleteApplication(id);
      setApplications(applications.filter((app) => app.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete application');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      phone_screen: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      technical: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      onsite: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
      offer: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  const filtered =
    filter === 'all'
      ? applications
      : filter === 'applied'
      ? applications.filter((app) => app.status === 'applied')
      : filter === 'rejected'
      ? applications.filter((app) => app.status === 'rejected')
      : filter === 'in_progress'
      ? applications.filter((app) => app.status !== 'applied' && app.status !== 'rejected')
      : applications;

  if (loading) {
    return <div className="text-center py-8 text-gray-900 dark:text-zinc-100">Loading...</div>;
  }

  const inProgressCount = applications.filter((app) => app.status !== 'applied' && app.status !== 'rejected').length;
  const appliedCount = applications.filter((app) => app.status === 'applied').length;
  const rejectedCount = applications.filter((app) => app.status === 'rejected').length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-zinc-700 dark:bg-zinc-700 text-white' : 'bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300'}`}
        >
          All ({applications.length})
        </button>
        <button
          onClick={() => setFilter('applied')}
          className={`px-3 py-1 rounded text-sm ${filter === 'applied' ? 'bg-zinc-700 dark:bg-zinc-700 text-white' : 'bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300'}`}
        >
          Applied ({appliedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1 rounded text-sm ${filter === 'rejected' ? 'bg-zinc-700 dark:bg-zinc-700 text-white' : 'bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300'}`}
        >
          Rejected ({rejectedCount})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-3 py-1 rounded text-sm ${filter === 'in_progress' ? 'bg-zinc-700 dark:bg-zinc-700 text-white' : 'bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300'}`}
        >
          In Progress ({inProgressCount})
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-zinc-800">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                Applied
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-zinc-100">{app.company_name}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-zinc-100">{app.position_title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-zinc-100">
                  {new Date(app.date_applied).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(app.status)} dark:opacity-90`}
                  >
                    {app.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-zinc-100">
                  {app.salary_min && app.salary_max
                    ? `$${(app.salary_min / 1000).toFixed(0)}k - $${(app.salary_max / 1000).toFixed(0)}k`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => onView(app)}
                    className="text-zinc-700 dark:text-zinc-300 hover:underline text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(app)}
                    className="text-zinc-700 dark:text-zinc-300 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-red-600 dark:text-red-400 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
          No applications found
        </div>
      )}
    </div>
  );
}
