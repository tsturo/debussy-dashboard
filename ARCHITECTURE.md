# Debussy Dashboard - Architecture Documentation

## Overview

The Debussy Dashboard is a Next.js-based web application designed to visualize and monitor the Debussy multi-agent orchestration system. It provides real-time insights into task pipelines, agent status, and system performance.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Dashboard                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Status     │  │   Pipeline   │  │   Metrics    │     │
│  │  Dashboard   │  │    Kanban    │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           TanStack Query + Zustand State            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes                      │  │
│  │  /api/mailbox    /api/beads    /api/stats          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Debussy System                              │
│                                                              │
│  .claude/mailbox/                    bd CLI                 │
│  ├── architect/inbox/                ├── bd list            │
│  ├── developer/inbox/                ├── bd show <id>       │
│  ├── tester/inbox/                   ├── bd ready           │
│  └── ...                             └── bd stats           │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **UI Components**: Custom components with Tailwind

### Backend
- **API**: Next.js API Routes
- **Data Sources**:
  - File system polling (.claude/mailbox)
  - CLI execution (bd commands)
  - Git information (optional)

### Data Flow
- **Polling Interval**: 2-5 seconds
- **Caching**: TanStack Query with stale-while-revalidate
- **Real-time Updates**: Server-sent polling (WebSocket optional for v2)

## Data Models

### Message (from mailbox)
```typescript
interface Message {
  id: string;                    // msg-{timestamp}
  sender: AgentType;
  recipient: AgentType;
  subject: string;
  body: string;
  bead_id?: string;
  priority: number;              // 1-5 (1=highest)
  created_at: string;            // ISO timestamp
}
```

### Bead (from bd CLI)
```typescript
interface Bead {
  id: string;                    // bd-xxx or {project}-xxx
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'done';
  type: 'task' | 'feature' | 'bug' | 'refactor' | 'test' | 'review' | 'integration';
  priority: number;              // 0-4 (0=critical, 4=backlog)
  assignee?: AgentType;
  created_at: string;
  updated_at: string;
  dependencies?: string[];       // Bead IDs this depends on
  blocked_by?: string[];         // Bead IDs blocking this
  labels?: string[];             // passed, failed, approved, changes-requested
  comments?: string[];
  parent_bead?: string;
  git_branch?: string;
  commits?: string[];
}
```

### AgentType
```typescript
type AgentType =
  | 'conductor'
  | 'architect'
  | 'developer'
  | 'developer2'
  | 'tester'
  | 'reviewer'
  | 'integrator';
```

### AgentStatus
```typescript
interface AgentStatus {
  agent: AgentType;
  inbox_count: number;           // Messages pending
  current_task?: string;         // Current bead ID
  status: 'idle' | 'running' | 'stopped';
  last_activity?: string;        // ISO timestamp
}
```

### SystemState
```typescript
interface SystemState {
  agents: AgentStatus[];
  total_beads: number;
  beads_by_status: {
    open: number;
    in_progress: number;
    done: number;
  };
  beads_by_stage: {
    planning: number;
    development: number;
    testing: number;
    review: number;
    integration: number;
    completed: number;
  };
  ready_tasks: number;           // Unblocked tasks
  blocked_tasks: number;
}
```

## API Routes

### GET /api/mailbox
Returns all pending messages for all agents.

**Response:**
```json
{
  "agents": [
    {
      "agent": "architect",
      "inbox_count": 2,
      "messages": [...]
    }
  ],
  "total_messages": 5,
  "updated_at": "2026-01-29T12:00:00Z"
}
```

### GET /api/mailbox/[agent]
Returns messages for a specific agent.

**Response:**
```json
{
  "agent": "developer",
  "messages": [...],
  "count": 3
}
```

### GET /api/beads
Returns all beads with optional filtering.

**Query Params:**
- `status`: open | in_progress | done
- `assignee`: agent name
- `type`: task | feature | bug | etc.
- `priority`: 0-4

**Response:**
```json
{
  "beads": [...],
  "total": 42,
  "filtered": 15
}
```

### GET /api/beads/[id]
Returns detailed information about a specific bead.

**Response:**
```json
{
  "bead": {...},
  "dependencies": [...],
  "blocked_by": [...],
  "related_messages": [...]
}
```

### GET /api/beads/ready
Returns beads that are ready to work (no blockers).

**Response:**
```json
{
  "ready_beads": [...],
  "count": 8
}
```

### GET /api/stats
Returns system-wide statistics.

**Response:**
```json
{
  "system_state": {...},
  "timeline": {
    "tasks_per_day": [...],
    "avg_completion_time": 4.2,
    "bottlenecks": [...]
  },
  "agent_performance": [...]
}
```

## Component Architecture

### Page Structure
```
/app
├── page.tsx                    # Status Dashboard (/)
├── pipeline/
│   └── page.tsx               # Kanban Board (/pipeline)
├── task/
│   └── [id]/
│       └── page.tsx           # Task Details (/task/[id])
├── metrics/
│   └── page.tsx               # Metrics Dashboard (/metrics)
└── layout.tsx                 # Root layout with navigation
```

### Key Components

#### StatusDashboard
- Displays agent status cards (inbox count, current task)
- System health indicators
- Quick stats (total tasks, ready tasks, blocked tasks)
- Auto-refreshes every 5 seconds

#### PipelineKanban
- Six columns: Planning → Development → Testing → Review → Integration → Done
- Drag-and-drop support (future)
- Task cards with: bead ID, title, assignee, priority badge
- Filtering by agent, priority, type
- Real-time updates

#### TaskDetailView
- Full bead information
- Dependency graph visualization
- Timeline of status changes
- Related messages
- Git branch and commit links
- Inline status updates

#### MetricsDashboard
- Charts:
  - Tasks completed per day (line chart)
  - Tasks by status (pie chart)
  - Average time per stage (bar chart)
  - Agent utilization (bar chart)
  - Bottleneck detection (table)
- Date range filtering
- Export to CSV

#### Navigation
- Persistent navigation bar
- Active route indicator
- Quick stats in nav (total pending messages)
- Agent status indicators (color-coded dots)

## Data Flow Patterns

### Polling Strategy
```typescript
// TanStack Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,        // 5 seconds
      staleTime: 2000,              // 2 seconds
      cacheTime: 300000,            // 5 minutes
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});
```

### State Management
```typescript
// Zustand store for UI state
interface DashboardStore {
  selectedAgent: AgentType | null;
  selectedBead: string | null;
  filters: {
    status?: string[];
    priority?: number[];
    assignee?: AgentType[];
  };
  setSelectedAgent: (agent: AgentType) => void;
  setSelectedBead: (beadId: string) => void;
  updateFilters: (filters: Partial<Filters>) => void;
}
```

## File System Integration

### Mailbox Polling
```typescript
// API route implementation
async function getMailboxMessages(agent: AgentType): Promise<Message[]> {
  const inboxPath = `.claude/mailbox/${agent}/inbox`;
  const files = await fs.readdir(inboxPath);

  // Sort by filename (priority_timestamp_id.json)
  const sortedFiles = files.sort();

  const messages = await Promise.all(
    sortedFiles.map(async (file) => {
      const content = await fs.readFile(path.join(inboxPath, file), 'utf-8');
      return JSON.parse(content);
    })
  );

  return messages;
}
```

### BD CLI Integration
```typescript
// Execute bd commands
async function executeBdCommand(command: string): Promise<any> {
  const { stdout, stderr } = await exec(`bd ${command}`);

  if (stderr) {
    throw new Error(stderr);
  }

  return parseBdOutput(stdout, command);
}

// Parse different bd command outputs
function parseBdOutput(output: string, command: string) {
  if (command.startsWith('list')) {
    return parseBeadList(output);
  } else if (command.startsWith('show')) {
    return parseBeadDetails(output);
  } else if (command === 'stats') {
    return parseStats(output);
  }
  // ... etc
}
```

## Performance Considerations

### Optimization Strategies
1. **Incremental Updates**: Only fetch changed data
2. **Pagination**: Limit initial data load
3. **Virtualization**: For long lists (react-window)
4. **Memoization**: React.memo for expensive components
5. **Debouncing**: Search and filter inputs
6. **Code Splitting**: Dynamic imports for charts

### Caching Strategy
- **Short-term cache**: TanStack Query (5 minutes)
- **Optimistic updates**: Immediate UI feedback
- **Background refetch**: Keep data fresh without blocking UI

## Error Handling

### API Error Responses
```typescript
interface ApiError {
  error: string;
  code: string;
  details?: any;
}
```

### Error Boundaries
- Page-level error boundaries
- Component-level fallbacks
- Toast notifications for user actions
- Retry mechanisms for failed requests

## Security Considerations

### Access Control
- Dashboard runs locally (no authentication needed)
- Read-only operations only
- No direct bd CLI write operations from UI
- Validate all file paths to prevent traversal

### Data Validation
- Validate JSON structure from mailbox files
- Sanitize bd CLI output
- Type safety with TypeScript
- Input validation for filters

## Future Enhancements

### Phase 2 Features
1. **WebSocket Integration**: Replace polling with real-time updates
2. **Task Assignment UI**: Assign tasks directly from dashboard
3. **Dependency Graph**: Interactive visualization
4. **Timeline View**: Gantt chart for task scheduling
5. **Search**: Full-text search across beads and messages
6. **Notifications**: Browser notifications for critical events
7. **Export**: Export reports and metrics
8. **Themes**: Dark mode support

### Phase 3 Features
1. **Git Integration**: Show diffs and file changes
2. **Code Review UI**: Inline code review from dashboard
3. **Agent Logs**: View agent execution logs
4. **Manual Interventions**: Pause/resume agents
5. **Historical Analytics**: Long-term trend analysis
6. **Multi-Project Support**: Switch between different Debussy projects

## Development Guidelines

### Code Organization
```
/src
├── app/                        # Next.js app directory
├── components/                 # React components
│   ├── dashboard/
│   ├── pipeline/
│   ├── metrics/
│   └── common/
├── lib/                        # Utilities
│   ├── api/                   # API client functions
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Helper functions
│   └── store/                 # Zustand stores
└── hooks/                      # Custom React hooks
```

### Naming Conventions
- Components: PascalCase (TaskCard.tsx)
- Utilities: camelCase (parseBeadId.ts)
- Constants: UPPER_SNAKE_CASE (AGENT_TYPES.ts)
- Types: PascalCase with descriptive names (BeadStatus)

### Testing Strategy
- Unit tests: Utility functions
- Integration tests: API routes
- E2E tests: Critical user flows
- Visual regression: Storybook snapshots

## Deployment

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Configuration
- Environment variables in `.env.local`
- Dashboard config in `dashboard.config.ts`
- Paths configured for Debussy project location

### Requirements
- Node.js 18+
- Access to .claude/mailbox directory
- bd CLI available in PATH
- Git repository (for commit information)

## Monitoring & Debugging

### Logging
- API route logging for debugging
- Console errors for development
- Error tracking (optional: Sentry)

### Performance Monitoring
- React DevTools Profiler
- Next.js Analytics
- Custom performance metrics

## Implementation Task Breakdown

The implementation is divided into 10 main tasks with dependencies:

1. **debussy-dashboard-cus**: Project setup (foundational)
2. **debussy-dashboard-2hc**: Mailbox API (depends on #1)
3. **debussy-dashboard-ltb**: BD CLI API (depends on #1)
4. **debussy-dashboard-3p4**: Data models (depends on #1)
5. **debussy-dashboard-cbt**: Navigation (depends on #1)
6. **debussy-dashboard-d94**: Status Dashboard (depends on #2, #3, #4, #5)
7. **debussy-dashboard-04y**: Kanban Board (depends on #2, #3, #4, #5)
8. **debussy-dashboard-5mq**: Task Details (depends on #2, #3, #4, #5)
9. **debussy-dashboard-2dm**: Real-time updates (depends on #2, #3)
10. **debussy-dashboard-wx8**: Metrics Dashboard (depends on #2, #3, #4, #5)

Execute `bd ready` to see which tasks are ready to implement.
