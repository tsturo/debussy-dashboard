'use client';

import { SystemState } from '@/lib/types';

interface SystemHealthPanelProps {
  systemState: SystemState;
}

export default function SystemHealthPanel({ systemState }: SystemHealthPanelProps) {
  const healthMetrics = [
    {
      label: 'Total Beads',
      value: systemState.total_beads,
      color: 'text-gray-700',
    },
    {
      label: 'Ready to Work',
      value: systemState.ready_tasks,
      color: 'text-green-600',
      highlight: true,
    },
    {
      label: 'In Progress',
      value: systemState.beads_by_status.in_progress,
      color: 'text-blue-600',
    },
    {
      label: 'Blocked',
      value: systemState.beads_by_status.blocked,
      color: 'text-red-600',
      warning: systemState.beads_by_status.blocked > 0,
    },
    {
      label: 'Completed',
      value: systemState.beads_by_status.closed,
      color: 'text-purple-600',
    },
  ];

  const calculateHealth = () => {
    const total = systemState.total_beads;
    if (total === 0) return { status: 'No Data', color: 'text-gray-500' };

    const blocked = systemState.beads_by_status.blocked;
    const inProgress = systemState.beads_by_status.in_progress;
    const ready = systemState.ready_tasks;

    if (blocked > total * 0.3) {
      return { status: 'Critical', color: 'text-red-600' };
    }
    if (blocked > total * 0.15) {
      return { status: 'Warning', color: 'text-orange-600' };
    }
    if (ready > 0 || inProgress > 0) {
      return { status: 'Healthy', color: 'text-green-600' };
    }
    return { status: 'Idle', color: 'text-gray-600' };
  };

  const health = calculateHealth();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">System Health</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`text-lg font-bold ${health.color}`}>
            {health.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {healthMetrics.map((metric) => (
          <div
            key={metric.label}
            className={`p-4 rounded-lg ${
              metric.highlight
                ? 'bg-green-50 border border-green-200'
                : metric.warning
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
            <div className={`text-3xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
