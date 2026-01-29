# Activity Dashboard Components

Beautiful, UX-friendly real-time activity monitoring components for the Debussy Dashboard.

## Components

### AgentDashboard
Displays a grid of agent status cards showing the current state of all agents in the system.

**Features:**
- Responsive grid layout (1-5 columns based on screen size)
- Real-time status updates
- Visual indicators for agent activity

**Props:**
```typescript
interface AgentDashboardProps {
  agents: AgentStatus[];
}
```

### AgentStatusCard
Individual agent card with rich visual feedback and animations.

**Features:**
- Emoji-based agent icons
- Animated status indicators (pulse for idle, ping for running)
- Glassmorphism effect for running agents
- Inbox count badge with emphasis on non-zero counts
- Current task display with line clamping
- Hover effects and smooth transitions

**Props:**
```typescript
interface AgentStatusCardProps {
  agent: AgentType;
  inbox_count: number;
  current_task?: string;
  status: AgentStatusType;
  last_activity?: string;
}
```

### ActivityFeed
Chronological feed of system events with smooth animations.

**Features:**
- Color-coded event types
- Slide-in animations for new events
- Relative timestamps (e.g., "2m ago")
- Event metadata display
- Custom scrollbar styling
- Empty state with helpful messaging
- Auto-scrolling support

**Event Types:**
- `task_started` - Blue, play icon
- `task_completed` - Green, checkmark icon
- `error` - Red, X icon
- `status_change` - Yellow, refresh icon
- `message_sent` - Purple, envelope icon

**Props:**
```typescript
interface ActivityFeedProps {
  events: ActivityEvent[];
  autoScroll?: boolean;
}
```

### ActivityDashboardView
Combined view showing both agent dashboard and activity feed.

**Features:**
- Consistent spacing and layout
- Header with title and description
- Responsive design
- Proper visual hierarchy

**Props:**
```typescript
interface ActivityDashboardViewProps {
  agents: AgentStatus[];
  events: ActivityEvent[];
}
```

## Design Philosophy

### Visual Design
- **Consistent theme**: Uses existing dark mode color palette
- **Glassmorphism**: Subtle gradients and transparency effects
- **60fps animations**: Smooth, performant transitions
- **Color coding**: Intuitive visual language for different states

### UX Principles
- **Real-time feedback**: Immediate visual updates for state changes
- **Progressive disclosure**: Show relevant info without overwhelming
- **Skeleton loading**: Graceful loading states (ready for integration)
- **Empty states**: Helpful messaging when no data available
- **Accessibility**: Semantic HTML and ARIA labels

### Animation Strategy
- **Slide-in**: New activity events enter from the left
- **Pulse**: Idle agents have subtle pulsing indicator
- **Ping**: Running agents have expanding ring animation
- **Fade**: Gentle appearance for existing content
- **Hover**: Scale and shadow effects on interaction

## Usage Example

```typescript
import { ActivityDashboardView } from '@/components/activity';

export default function Page() {
  const agents = [
    {
      agent: 'developer',
      inbox_count: 2,
      current_task: 'Implementing feature',
      status: 'running',
      last_activity: '1m ago',
    },
  ];

  const events = [
    {
      id: '1',
      type: 'task_started',
      agent: 'developer',
      message: 'Started new task',
      timestamp: new Date().toISOString(),
      metadata: { bead_id: 'xyz' },
    },
  ];

  return <ActivityDashboardView agents={agents} events={events} />;
}
```

## Customization

### Adding New Agent Icons
Edit `agentIcons` in `AgentStatusCard.tsx`:
```typescript
const agentIcons: Record<AgentType, string> = {
  conductor: '🎼',
  developer: '💻',
  // Add more...
};
```

### Adding New Event Types
Edit `eventConfig` in `ActivityFeed.tsx`:
```typescript
const eventConfig: Record<ActivityEventType, {...}> = {
  new_type: {
    icon: '🎉',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-500',
  },
};
```

## Performance Considerations

- Components use React hooks for efficient updates
- Animations are GPU-accelerated (transform, opacity)
- Event list limited to prevent memory issues
- Virtualization ready (can be added for very long lists)

## Future Enhancements

- [ ] Virtual scrolling for very long activity feeds
- [ ] WebSocket integration for real-time updates
- [ ] Filtering and search capabilities
- [ ] Export activity log functionality
- [ ] Agent interaction history timeline
- [ ] Customizable dashboard layouts
