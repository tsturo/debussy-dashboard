'use client';

import { LogEntry, LogLevel } from '@/lib/types';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTheme } from '@/lib/hooks';

interface LogStatsProps {
  logs: LogEntry[];
}

const LEVEL_COLORS = {
  debug: '#9CA3AF',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

export default function LogStats({ logs }: LogStatsProps) {
  const { theme } = useTheme();

  const stats = useMemo(() => {
    const levelCounts: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };

    const agentCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    logs.forEach((log) => {
      levelCounts[log.level]++;
      agentCounts[log.agent] = (agentCounts[log.agent] || 0) + 1;
      categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
    });

    return { levelCounts, agentCounts, categoryCounts };
  }, [logs]);

  const levelData = useMemo(
    () =>
      Object.entries(stats.levelCounts).map(([level, count]) => ({
        name: level,
        count,
        fill: LEVEL_COLORS[level as LogLevel],
      })),
    [stats.levelCounts]
  );

  const agentData = useMemo(
    () =>
      Object.entries(stats.agentCounts).map(([agent, count]) => ({
        name: agent,
        count,
      })),
    [stats.agentCounts]
  );

  const categoryData = useMemo(
    () =>
      Object.entries(stats.categoryCounts).map(([category, count]) => ({
        name: category,
        count,
      })),
    [stats.categoryCounts]
  );

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-dark-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Log Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-dark-300 mb-1">
            Total Logs
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{logs.length}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">Info</h3>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {stats.levelCounts.info}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-300 mb-1">
            Warnings
          </h3>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {stats.levelCounts.warn}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-300 mb-1">Errors</h3>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {stats.levelCounts.error}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">
            Logs by Level
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={levelData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.count}`}
              >
                {levelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                  borderRadius: '0.375rem',
                  color: theme === 'dark' ? '#F3F4F6' : '#111827',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">
            Logs by Agent
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                  borderRadius: '0.375rem',
                  color: theme === 'dark' ? '#F3F4F6' : '#111827',
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">
          Logs by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categoryData.map((item) => (
            <div
              key={item.name}
              className="bg-gray-50 dark:bg-dark-900 rounded-lg p-3 text-center"
            >
              <p className="text-xs text-gray-600 dark:text-dark-400 capitalize mb-1">
                {item.name}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-dark-100">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
