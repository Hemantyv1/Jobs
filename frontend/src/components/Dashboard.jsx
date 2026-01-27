import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../api';

const STATUS_COLORS = {
  applied: '#3B82F6',
  phone_screen: '#FBBF24',
  technical: '#A855F7',
  onsite: '#6366F1',
  offer: '#10B981',
  rejected: '#EF4444',
};

export default function Dashboard() {
  const [statusData, setStatusData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [status, skills, timeline] = await Promise.all([
        api.getStatusBreakdown(),
        api.getTopSkills(),
        api.getTimeline(),
      ]);

      setStatusData(status);
      setSkillsData(skills);
      setTimelineData(
        timeline.map((t) => ({
          week: new Date(t.week).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          }),
          count: parseInt(t.count, 10),
        })).reverse()
      );
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-900 dark:text-zinc-100">Loading dashboard...</div>;
  }

  const totalApplications = statusData.reduce(
    (sum, item) => sum + parseInt(item.count, 10),
    0
  );
  const activeApplications = statusData
    .filter((item) => !['rejected', 'offer'].includes(item.status))
    .reduce((sum, item) => sum + parseInt(item.count, 10), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
          <h3 className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
            Total Applications
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
            {totalApplications}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
          <h3 className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Active</h3>
          <p className="text-3xl font-bold text-zinc-700 dark:text-zinc-300 mt-2">
            {activeApplications}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
          <h3 className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
            Unique Skills Tracked
          </h3>
          <p className="text-3xl font-bold text-zinc-700 dark:text-zinc-300 mt-2">
            {skillsData.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">
            Applications by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) =>
                  `${entry.status.replace('_', ' ')} (${entry.count})`
                }
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={STATUS_COLORS[entry.status] || '#94A3B8'}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">
            Most Required Skills
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillsData.slice(0, 8)}>
              <XAxis
                dataKey="skill_name"
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="#71717A"
              />
              <YAxis stroke="#71717A" />
              <Tooltip />
              <Bar dataKey="count" fill="#71717A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {timelineData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">Application Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <XAxis dataKey="week" stroke="#71717A" />
              <YAxis stroke="#71717A" />
              <Tooltip />
              <Bar dataKey="count" fill="#71717A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
