# Activity Feed & Agent Dashboard - UI/UX Design Specification

## Overview
The Activity Feed & Agent Dashboard provides real-time monitoring of agent status and system activity with a focus on beautiful, polished, and user-friendly design.

## Design System

### Visual Style
- **Glassmorphism**: Translucent backgrounds with backdrop blur for depth
- **Subtle Gradients**: Smooth color transitions for visual interest
- **Smooth Animations**: 60fps animations for professional feel
- **Dark Mode First**: Optimized for both light and dark themes

### Color Palette
- **Primary**: Blue (sky-500 to sky-600)
- **Success**: Green (for completed tasks, active agents)
- **Error**: Red (for errors, stopped agents)
- **Warning**: Yellow (for status changes)
- **Info**: Purple (for messages)
- **Neutral**: Gray (for idle states)

## Component Specifications

### 1. Agent Status Cards

#### Layout
- **Grid**: Responsive grid (1 col mobile, 2 md, 3 lg, 5 xl)
- **Card**: Rounded-2xl with glassmorphic background
- **Padding**: 5 units (1.25rem)

#### Status Indicators
- **Idle**: Gray dot with subtle pulse animation
- **Running**: Green dot with ping animation + glow effect
- **Stopped**: Red dot (static)

#### Visual Effects
- **Active Glow**: Subtle gradient overlay for running agents
- **Hover**: Scale 1.03 + translate-y-1 + shadow-2xl
- **Transitions**: 300ms ease-out for all state changes

#### Content Structure
```
┌─────────────────────────────┐
│ [Icon] [Name]      [Badge]  │
│        [Status Dot]          │
│ ──────────────────────────  │
│ Current Task:               │
│ [Task description]          │
│ [Progress bar]              │
└─────────────────────────────┘
```

#### Progress Indicator
- Gradient bar (primary-500 to green-500)
- 2/3 width with pulse animation
- Only shown when task is active

### 2. Activity Feed

#### Layout
- **Max Height**: 600px with custom scrollbar
- **Spacing**: 3 units between items
- **Border**: Left 4px colored border per event type

#### Event Types & Colors
1. **Task Started** (Blue)
   - Icon: ▶️
   - Border: blue-500/60
   - Background: Gradient from blue-50

2. **Task Completed** (Green)
   - Icon: ✅
   - Border: green-500/60
   - Background: Gradient from green-50

3. **Error** (Red)
   - Icon: ❌
   - Border: red-500/60
   - Background: Gradient from red-50

4. **Status Change** (Yellow)
   - Icon: 🔄
   - Border: yellow-500/60
   - Background: Gradient from yellow-50

5. **Message Sent** (Purple)
   - Icon: 📨
   - Border: purple-500/60
   - Background: Gradient from purple-50

#### Animations
- **New Events**: Slide-in from left (500ms)
- **Shimmer**: Subtle shine effect on new items
- **Hover**: Scale 1.01 + shadow-lg with colored glow
- **Stagger**: 50ms delay per item for cascading effect

#### Content Structure
```
┌─────────────────────────────────────────┐
│ [Icon] [AGENT]            [2m ago]     │
│        Event message text here...       │
│        [tag] [tag]                     │
└─────────────────────────────────────────┘
```

#### Empty State
- Centered icon (📭) with pulse animation
- Helpful message
- Loading dots with stagger animation

### 3. Dashboard View

#### Header
- **Title**: 4xl font with gradient text effect
- **Live Indicator**: Green pulsing dot with glow
- **Subtitle**: Large text (lg) with description

#### Stats Bar
- Agent counts (active/idle)
- Color-coded status dots
- Real-time updates

#### Layout
```
┌─────────────────────────────────────────┐
│ Activity Dashboard 🟢                   │
│ Real-time monitoring...                 │
├─────────────────────────────────────────┤
│ Agent Status          [3 active • 2 idle]│
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │Agent1│ │Agent2│ │Agent3│ │Agent4│    │
│ └──────┘ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────────────┤
│ Activity Feed                            │
│ ┌─────────────────────────────────────┐ │
│ │ Event 1                             │ │
│ │ Event 2                             │ │
│ │ Event 3                             │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Skeleton Loaders

### Agent Status Skeleton
- Pulsing gray placeholders
- Mimics card structure
- Staggered animation delays

### Activity Feed Skeleton
- 5 placeholder items
- Gradient pulse effect
- 100ms stagger between items

## Responsive Design

### Breakpoints
- **Mobile** (< 768px): Single column, stacked layout
- **Tablet** (768px - 1024px): 2 columns for agents
- **Desktop** (1024px - 1280px): 3 columns for agents
- **Wide** (> 1280px): 5 columns for agents

### Mobile Optimizations
- Larger touch targets (min 44px)
- Simplified animations (reduce motion)
- Condensed spacing
- Scrollable containers

## Performance Considerations

### Animations
- Use CSS transforms (GPU accelerated)
- Avoid layout thrashing
- Debounce scroll events
- Use will-change sparingly

### Virtualization
- Implement for >50 activity items
- Maintain scroll position
- Lazy load older events

### Optimization
- Memoize event components
- Use React.memo for cards
- Batch DOM updates
- Throttle status updates

## Accessibility

### Keyboard Navigation
- Tab through agent cards
- Arrow keys for feed items
- Enter to expand details

### Screen Readers
- Semantic HTML elements
- ARIA labels for status
- Live regions for updates
- Alt text for icons

### Color Contrast
- WCAG AA compliance
- 4.5:1 minimum contrast
- Status not color-only
- Icons supplement color

## Implementation Files

- `ActivityDashboardView.tsx` - Main container
- `AgentDashboard.tsx` - Agent status grid
- `AgentStatusCard.tsx` - Individual agent card
- `ActivityFeed.tsx` - Event feed component
- `AgentStatusSkeleton.tsx` - Loading state for agents
- `ActivityFeedSkeleton.tsx` - Loading state for feed
- `index.ts` - Component exports

## Usage Example

```tsx
import { ActivityDashboardView } from '@/components/activity';

export default function ActivityPage() {
  const { agents, events, loading } = useActivityData();

  if (loading) {
    return (
      <>
        <AgentStatusSkeleton />
        <ActivityFeedSkeleton />
      </>
    );
  }

  return <ActivityDashboardView agents={agents} events={events} />;
}
```

## Future Enhancements

1. **Filtering**: Filter events by type, agent, or time range
2. **Search**: Full-text search across events
3. **Notifications**: Toast notifications for critical events
4. **Export**: Download activity log as CSV/JSON
5. **Details Modal**: Click event for detailed view
6. **Charts**: Visualize activity trends over time
