import { AgentType } from '@/lib/types';

interface AgentBadgeProps {
  agent: AgentType;
}

export default function AgentBadge({ agent }: AgentBadgeProps) {
  const agentColors = {
    conductor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    architect: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    developer: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
    developer2: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
    tester: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    reviewer: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    integrator: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${
        agentColors[agent] || 'bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-dark-300 border-gray-300 dark:border-dark-600'
      }`}
    >
      {agent}
    </span>
  );
}
