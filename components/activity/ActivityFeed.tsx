'use client';

import { useState, useEffect } from 'react';

export type ActivityEventType =
  | 'task_started'
  | 'task_completed'
  | 'error'
  | 'status_change'
  | 'message_sent';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  agent: string;
  message: string;
  timestamp: string;
  priority?: number;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  autoScroll?: boolean;
}

const eventConfig: Record<ActivityEventType, {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}> = {
  task_started: {
    icon: '▶️',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-gradient-to-br from-blue-50 via-blue-50/50 to-transparent dark:from-blue-900/20 dark:via-blue-900/10 dark:to-transparent',
    borderColor: 'border-blue-500/60 dark:border-blue-400/40',
    glowColor: 'hover:shadow-blue-500/20',
  },
  task_completed: {
    icon: '✅',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-gradient-to-br from-green-50 via-green-50/50 to-transparent dark:from-green-900/20 dark:via-green-900/10 dark:to-transparent',
    borderColor: 'border-green-500/60 dark:border-green-400/40',
    glowColor: 'hover:shadow-green-500/20',
  },
  error: {
    icon: '❌',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-gradient-to-br from-red-50 via-red-50/50 to-transparent dark:from-red-900/20 dark:via-red-900/10 dark:to-transparent',
    borderColor: 'border-red-500/60 dark:border-red-400/40',
    glowColor: 'hover:shadow-red-500/20',
  },
  status_change: {
    icon: '🔄',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-gradient-to-br from-yellow-50 via-yellow-50/50 to-transparent dark:from-yellow-900/20 dark:via-yellow-900/10 dark:to-transparent',
    borderColor: 'border-yellow-500/60 dark:border-yellow-400/40',
    glowColor: 'hover:shadow-yellow-500/20',
  },
  message_sent: {
    icon: '📨',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-gradient-to-br from-purple-50 via-purple-50/50 to-transparent dark:from-purple-900/20 dark:via-purple-900/10 dark:to-transparent',
    borderColor: 'border-purple-500/60 dark:border-purple-400/40',
    glowColor: 'hover:shadow-purple-500/20',
  },
};

function getRelativeTime(timestamp: string): string {
  const now = new Date().getTime();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function ActivityFeed({ events, autoScroll = false }: ActivityFeedProps) {
  const [visibleEvents, setVisibleEvents] = useState<ActivityEvent[]>([]);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    const newIds = new Set<string>();
    events.forEach((event) => {
      if (!visibleEvents.find((e) => e.id === event.id)) {
        newIds.add(event.id);
      }
    });

    setVisibleEvents(events);
    setNewEventIds(newIds);

    if (newIds.size > 0) {
      const timer = setTimeout(() => {
        setNewEventIds(new Set());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [events, visibleEvents]);

  const handleEventClick = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  if (visibleEvents.length === 0) {
    return (
      <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-700/50 p-12">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-6xl animate-pulse">📭</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-dark-100">
            No Activity Yet
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Activity events will appear here in real-time
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-gray-300 dark:bg-dark-600 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-300 dark:bg-dark-600 rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-gray-300 dark:bg-dark-600 rounded-full animate-pulse delay-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-100">
        Activity Feed
      </h2>
      <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-700/50 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-4 space-y-3">
          {visibleEvents.map((event, index) => {
            const config = eventConfig[event.type];
            const isNew = newEventIds.has(event.id);
            const isExpanded = expandedEventId === event.id;
            const hasMetadata = event.metadata && Object.keys(event.metadata).length > 0;

            return (
              <div
                key={event.id}
                onClick={() => hasMetadata && handleEventClick(event.id)}
                className={`
                  relative overflow-hidden
                  rounded-xl border-l-4 ${config.borderColor}
                  ${config.bgColor}
                  backdrop-blur-sm
                  p-4
                  transition-all duration-500 ease-out
                  ${isNew ? 'animate-slide-in-bottom' : 'animate-fade-in-scale'}
                  hover:shadow-xl ${config.glowColor}
                  hover:scale-[1.02]
                  ${hasMetadata ? 'cursor-pointer' : ''}
                  ${isExpanded ? 'ring-2 ring-primary-500/50 dark:ring-primary-400/50' : ''}
                `}
                style={{
                  animationDelay: isNew ? `${index * 50}ms` : `${index * 30}ms`,
                }}
              >
                {isNew && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/5 dark:to-transparent animate-shimmer pointer-events-none" />
                )}

                <div className="flex items-start space-x-3 relative z-10">
                  <div className="text-2xl flex-shrink-0 mt-0.5 transform transition-transform duration-300 hover:scale-125 hover:rotate-12">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold uppercase tracking-wide ${config.color} transition-colors duration-300`}>
                        {event.agent}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-dark-400 font-medium px-2.5 py-1 bg-white/60 dark:bg-dark-800/60 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-dark-800/80">
                        {getRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-dark-200 leading-relaxed">
                      {event.message}
                    </p>
                    {hasMetadata && (
                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-3' : 'max-h-0 mt-0'}`}>
                        <div className="flex flex-wrap gap-2 animate-fade-in">
                          {Object.entries(event.metadata).map(([key, value], idx) => (
                            <span
                              key={key}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-white/70 dark:bg-dark-800/70 backdrop-blur-sm text-gray-600 dark:text-dark-300 border border-gray-200/50 dark:border-dark-700/50 hover:bg-white/90 dark:hover:bg-dark-800/90 transition-all duration-200 animate-slide-in-bottom"
                              style={{ animationDelay: `${idx * 50}ms` }}
                            >
                              <span className="font-semibold">{key}:</span> {String(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {hasMetadata && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-dark-400">
                        <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
