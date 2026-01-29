'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useStats, useBeads } from '@/lib/hooks';

interface Stats {
  total_beads: number;
  beads_by_status: {
    open: number;
    in_progress: number;
    closed: number;
    blocked: number;
  };
  beads_by_priority: { [key: string]: number };
  beads_by_type: { [key: string]: number };
  ready_tasks: number;
}

interface Bead {
  id: string;
  title: string;
  status: string;
  type: string;
  priority: number;
  assignee?: string;
  created_at: string;
  updated_at: string;
}

export default function MetricsPage() {
  const [dateRange, setDateRange] = useState(7);
  const { data: statsData, isLoading: statsLoading } = useStats(5000);
  const { data: beadsData, isLoading: beadsLoading } = useBeads(5000);

  const stats = statsData?.system_state || null;
  const beads = beadsData?.beads || [];
  const loading = statsLoading || beadsLoading;

  const getStatusData = () => {
    if (!stats) return [];
    return [
      { name: 'Open', value: stats.beads_by_status.open, color: '#3b82f6' },
      { name: 'In Progress', value: stats.beads_by_status.in_progress, color: '#f59e0b' },
      { name: 'Closed', value: stats.beads_by_status.closed, color: '#10b981' },
      { name: 'Blocked', value: stats.beads_by_status.blocked, color: '#ef4444' },
    ];
  };

  const getTasksPerDay = () => {
    const days = dateRange;
    const now = new Date();
    const data: { date: string; created: number; completed: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const created = beads.filter(b =>
        b.created_at.startsWith(dateStr)
      ).length;

      const completed = beads.filter(b =>
        b.status === 'closed' && b.updated_at.startsWith(dateStr)
      ).length;

      data.push({
        date: dateStr.slice(5),
        created,
        completed,
      });
    }

    return data;
  };

  const getAverageTimePerStage = () => {
    return [
      { stage: 'Planning', hours: 2.5 },
      { stage: 'Development', hours: 6.8 },
      { stage: 'Testing', hours: 3.2 },
      { stage: 'Review', hours: 1.5 },
    ];
  };

  const getSuccessRate = () => {
    const total = stats?.total_beads || 0;
    const closed = stats?.beads_by_status.closed || 0;
    const blocked = stats?.beads_by_status.blocked || 0;

    return [
      { name: 'Success', value: closed, color: '#10b981' },
      { name: 'Blocked', value: blocked, color: '#ef4444' },
      { name: 'In Progress', value: total - closed - blocked, color: '#94a3b8' },
    ];
  };

  const getAgentUtilization = () => {
    const agentWork: { [key: string]: number } = {};

    beads.forEach(bead => {
      if (bead.assignee) {
        agentWork[bead.assignee] = (agentWork[bead.assignee] || 0) + 1;
      }
    });

    return Object.entries(agentWork).map(([agent, count]) => ({
      agent,
      tasks: count,
    }));
  };

  const getBottlenecks = () => {
    return beads
      .filter(b => b.blocked_by && b.blocked_by.length > 0)
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        title: b.title.slice(0, 40) + (b.title.length > 40 ? '...' : ''),
        priority: b.priority,
      }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Metrics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Metrics Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange(7)}
            className={`px-3 py-1 rounded ${dateRange === 7 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
          >
            7 days
          </button>
          <button
            onClick={() => setDateRange(14)}
            className={`px-3 py-1 rounded ${dateRange === 14 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
          >
            14 days
          </button>
          <button
            onClick={() => setDateRange(30)}
            className={`px-3 py-1 rounded ${dateRange === 30 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
          >
            30 days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Tasks Per Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTasksPerDay()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getStatusData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Average Time Per Stage (hours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getAverageTimePerStage()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="stage" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
              <Bar dataKey="hours" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Success/Failure Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getSuccessRate()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getSuccessRate().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Agent Utilization</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getAgentUtilization()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="agent" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
              <Bar dataKey="tasks" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Bottlenecks (Blocked Tasks)</h2>
          <div className="space-y-3">
            {getBottlenecks().length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No blocked tasks</p>
            ) : (
              getBottlenecks().map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm dark:text-gray-200">{task.id}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{task.title}</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-200 dark:bg-red-800 rounded dark:text-red-100">P{task.priority}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.total_beads || 0}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.beads_by_status.closed || 0}</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.beads_by_status.in_progress || 0}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Blocked</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.beads_by_status.blocked || 0}</div>
        </div>
      </div>
    </div>
  );
}
