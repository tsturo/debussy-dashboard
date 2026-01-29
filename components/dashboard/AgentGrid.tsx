'use client';

import { AgentMailbox, AgentStatusType } from '@/lib/types';
import AgentStatusCard from './AgentStatusCard';

interface AgentGridProps {
  agents: AgentMailbox[];
}

export default function AgentGrid({ agents }: AgentGridProps) {
  const getAgentStatus = (agent: AgentMailbox): AgentStatusType => {
    if (agent.inbox_count === 0) {
      return 'idle';
    }
    return 'running';
  };

  const getCurrentTask = (agent: AgentMailbox): string | undefined => {
    if (agent.messages.length > 0) {
      return agent.messages[0].subject;
    }
    return undefined;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Agent Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentStatusCard
            key={agent.agent}
            agent={agent.agent}
            inbox_count={agent.inbox_count}
            current_task={getCurrentTask(agent)}
            status={getAgentStatus(agent)}
          />
        ))}
      </div>
    </div>
  );
}
