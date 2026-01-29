'use client';

import { SystemState } from '@/lib/types';
import { useEffect, useState } from 'react';

interface SystemHealthPanelProps {
  systemState: SystemState;
}

export default function SystemHealthPanel({ systemState }: SystemHealthPanelProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [prevHealth, setPrevHealth] = useState<string>('');

  const healthMetrics = [
    {
      label: 'Total Beads',
      value: systemState.total_beads,
      color: 'text-gray-700 dark:text-dark-200',
      key: 'total_beads',
    },
    {
      label: 'Ready to Work',
      value: systemState.ready_tasks,
      color: 'text-green-600 dark:text-green-400',
      highlight: true,
      key: 'ready_tasks',
    },
    {
      label: 'In Progress',
      value: systemState.beads_by_status.in_progress,
      color: 'text-blue-600 dark:text-primary-400',
      key: 'in_progress',
    },
    {
      label: 'Blocked',
      value: systemState.beads_by_status.blocked,
      color: 'text-red-600 dark:text-red-400',
      warning: systemState.beads_by_status.blocked > 0,
      key: 'blocked',
    },
    {
      label: 'Completed',
      value: systemState.beads_by_status.closed,
      color: 'text-purple-600 dark:text-purple-400',
      key: 'completed',
    },
  ];

  useEffect(() => {
    const newValues: Record<string, number> = {};
    healthMetrics.forEach(metric => {
      newValues[metric.key] = metric.value;
    });
    setAnimatedValues(newValues);
  }, [systemState]);

  const calculateHealth = () => {
    const total = systemState.total_beads;
    if (total === 0) return { status: 'No Data', color: 'text-gray-500 dark:text-dark-400' };

    const blocked = systemState.beads_by_status.blocked;
    const inProgress = systemState.beads_by_status.in_progress;
    const ready = systemState.ready_tasks;

    if (blocked > total * 0.3) {
      return { status: 'Critical', color: 'text-red-600 dark:text-red-400' };
    }
    if (blocked > total * 0.15) {
      return { status: 'Warning', color: 'text-orange-600 dark:text-orange-400' };
    }
    if (ready > 0 || inProgress > 0) {
      return { status: 'Healthy', color: 'text-green-600 dark:text-green-400' };
    }
    return { status: 'Idle', color: 'text-gray-600 dark:text-dark-300' };
  };

  const health = calculateHealth();

  useEffect(() => {
    if (prevHealth !== '' && prevHealth !== health.status) {
      setPrevHealth(health.status);
    } else if (prevHealth === '') {
      setPrevHealth(health.status);
    }
  }, [health.status]);

  const hasHealthChanged = prevHealth !== health.status && prevHealth !== '';

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-dark-100">System Health</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-dark-300">Status:</span>
          <span className={`text-lg font-bold ${health.color} transition-all duration-300 ${hasHealthChanged ? 'animate-bounce-in' : ''}`}>
            {health.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {healthMetrics.map((metric, index) => {
          const hasValueChanged = animatedValues[metric.key] !== metric.value;

          return (
            <div
              key={metric.label}
              className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                metric.highlight
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : metric.warning
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 animate-pulse-once'
                  : 'bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700'
              }`}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="text-sm text-gray-600 dark:text-dark-300 mb-1">{metric.label}</div>
              <div className={`text-3xl font-bold ${metric.color} transition-all duration-300 ${hasValueChanged ? 'animate-count-up' : ''}`}>
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
