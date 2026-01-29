interface PriorityBadgeProps {
  priority: number;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    1: { label: 'P1', colors: 'bg-red-100 text-red-800 border-red-300' },
    2: { label: 'P2', colors: 'bg-orange-100 text-orange-800 border-orange-300' },
    3: { label: 'P3', colors: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    4: { label: 'P4', colors: 'bg-blue-100 text-blue-800 border-blue-300' },
    5: { label: 'P5', colors: 'bg-gray-100 text-gray-800 border-gray-300' },
  };

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig[3];

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold border ${config.colors}`}
    >
      {config.label}
    </span>
  );
}
