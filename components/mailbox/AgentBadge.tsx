import { AgentType } from '@/lib/types';

interface AgentBadgeProps {
  agent: AgentType;
}

export default function AgentBadge({ agent }: AgentBadgeProps) {
  const agentColors = {
    conductor: 'bg-purple-100 text-purple-800 border-purple-300',
    architect: 'bg-blue-100 text-blue-800 border-blue-300',
    developer: 'bg-green-100 text-green-800 border-green-300',
    developer2: 'bg-green-100 text-green-800 border-green-300',
    tester: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    reviewer: 'bg-orange-100 text-orange-800 border-orange-300',
    integrator: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${
        agentColors[agent] || 'bg-gray-100 text-gray-800 border-gray-300'
      }`}
    >
      {agent}
    </span>
  );
}
