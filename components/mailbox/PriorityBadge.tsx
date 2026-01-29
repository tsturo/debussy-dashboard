interface PriorityBadgeProps {
  priority: number;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    1: { label: 'P1', colors: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' },
    2: { label: 'P2', colors: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700' },
    3: { label: 'P3', colors: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' },
    4: { label: 'P4', colors: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
    5: { label: 'P5', colors: 'bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-dark-300 border-gray-300 dark:border-dark-600' },
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
