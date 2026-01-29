'use client';

import { AgentType, AgentStatusType } from '@/lib/types';
import { useEffect, useState } from 'react';

interface AgentStatusCardProps {
  agent: AgentType;
  inbox_count: number;
  current_task?: string;
  status: AgentStatusType;
  last_activity?: string;
}

const agentIcons: Record<AgentType, string> = {
  conductor: '🎼',
  architect: '🏛️',
  developer: '💻',
  tester: '🧪',
  reviewer: '👁️',
  integrator: '🔗',
};

const statusConfig = {
  idle: {
    color: 'bg-gray-400 dark:bg-gray-500',
    label: 'Idle',
    glowColor: 'shadow-gray-400/10 dark:shadow-gray-500/10',
    pulse: true,
  },
  running: {
    color: 'bg-green-500 dark:bg-green-400',
    label: 'Running',
    glowColor: 'shadow-green-500/30 dark:shadow-green-400/30',
    pulse: false,
  },
  stopped: {
    color: 'bg-red-500 dark:bg-red-400',
    label: 'Stopped',
    glowColor: 'shadow-red-500/20 dark:shadow-red-400/20',
    pulse: false,
  },
};

export function AgentStatusCard({
  agent,
  inbox_count,
  current_task,
  status,
  last_activity,
}: AgentStatusCardProps) {
  const [isNew, setIsNew] = useState(false);
  const config = statusConfig[status];

  useEffect(() => {
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 500);
    return () => clearTimeout(timer);
  }, [status, current_task]);

  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/90 dark:bg-dark-900/90
        backdrop-blur-sm
        rounded-2xl shadow-lg
        border border-gray-200/50 dark:border-dark-700/50
        p-5
        transition-all duration-300 ease-out
        hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1
        ${isNew ? 'animate-pulse-once' : ''}
        ${status === 'running' ? 'ring-2 ring-primary-500/30 dark:ring-primary-400/30 ' + config.glowColor : ''}
      `}
    >
      {status === 'running' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-green-500/5 pointer-events-none animate-glow" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="text-4xl transform transition-transform duration-300 hover:scale-110">
                {agentIcons[agent]}
              </div>
              {status === 'running' && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-green-500/20 rounded-full blur-md animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-dark-100 capitalize">
                {agent}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="relative flex items-center">
                  <span
                    className={`
                      block w-2.5 h-2.5 rounded-full ${config.color}
                      ${config.pulse ? 'animate-pulse' : ''}
                      shadow-lg ${config.glowColor}
                    `}
                  />
                  {status === 'running' && (
                    <span
                      className={`
                        absolute inset-0 w-2.5 h-2.5 rounded-full ${config.color}
                        animate-ping opacity-75
                      `}
                    />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-dark-300">
                  {config.label}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`
              px-3 py-1.5 rounded-full
              text-sm font-bold
              transition-all duration-300
              ${
                inbox_count > 0
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/40 hover:shadow-primary-500/60'
                  : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-dark-400'
              }
            `}
          >
            {inbox_count}
          </div>
        </div>

        {current_task && (
          <div className="space-y-2 animate-fade-in">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:from-transparent dark:via-dark-600 dark:to-transparent" />
            <div className="bg-gradient-to-br from-gray-50/50 to-transparent dark:from-dark-800/30 dark:to-transparent rounded-lg p-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wide">
                Current Task
              </span>
              <p className="text-sm text-gray-700 dark:text-dark-200 mt-1 line-clamp-2 leading-relaxed">
                {current_task}
              </p>
              <div className="mt-2 h-1 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-primary-500 to-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {last_activity && !current_task && (
          <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-dark-700/50">
            <span className="text-xs text-gray-500 dark:text-dark-400">
              Last seen: {last_activity}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
