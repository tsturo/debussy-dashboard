# Debussy Dashboard

A Next.js-based real-time dashboard for visualizing and monitoring the Debussy multi-agent orchestration system.

## Overview

Debussy Dashboard provides a web interface to monitor task pipelines, agent status, and system performance for the Debussy multi-agent software development system. It visualizes the flow of tasks through specialized agents (architect, developers, tester, reviewer, integrator) and provides insights into bottlenecks and system health.

## Features

### Core Features (MVP)
- **System Status Dashboard**: Real-time view of agent status and mailbox queues
- **Task Pipeline Kanban**: Visual board showing tasks moving through development stages
- **Task Details View**: Comprehensive information about individual tasks including dependencies and history
- **Real-time Updates**: Auto-refreshing data with 2-5 second polling interval

### Enhanced Features
- **Metrics Dashboard**: Charts and analytics on task completion, agent performance, and bottlenecks
- **Navigation**: Intuitive routing between different dashboard views
- **Filtering & Search**: Find tasks by status, agent, priority, or type

## Architecture

The dashboard is built on:
- **Next.js 14+** with App Router for server-side rendering and API routes
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **TanStack Query** for data fetching and caching
- **Zustand** for state management
- **Recharts** for data visualization

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## Data Sources

The dashboard integrates with:
1. **Mailbox System**: Reads JSON message files from `.claude/mailbox/{agent}/inbox/`
2. **Beads CLI**: Executes `bd` commands to fetch task information
3. **Git**: Optionally reads commit and branch information

## Prerequisites

- Node.js 18 or higher
- Access to a Debussy project directory with `.claude/mailbox/` structure
- `bd` CLI tool installed and available in PATH
- Git repository (optional, for commit tracking)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd debussy-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local to set DEBUSSY_PROJECT_PATH

# Start development server
npm run dev
```

Visit http://localhost:3000

## Configuration

Create `.env.local` with:

```env
# Path to your Debussy project
DEBUSSY_PROJECT_PATH=/path/to/your/debussy/project

# Polling interval (milliseconds)
POLLING_INTERVAL=5000

# Optional: Enable debug logging
DEBUG=true
```

## Project Structure

```
debussy-dashboard/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Status dashboard
│   │   ├── pipeline/          # Kanban board
│   │   ├── task/[id]/         # Task details
│   │   ├── metrics/           # Metrics dashboard
│   │   └── api/               # API routes
│   ├── components/             # React components
│   ├── lib/                    # Utilities and helpers
│   │   ├── types/             # TypeScript types
│   │   ├── api/               # API client functions
│   │   └── store/             # State management
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
├── ARCHITECTURE.md             # Technical documentation
└── package.json
```

## API Routes

The dashboard provides several API endpoints:

- `GET /api/mailbox` - All agent mailbox status
- `GET /api/mailbox/[agent]` - Specific agent messages
- `GET /api/beads` - List all tasks
- `GET /api/beads/[id]` - Task details
- `GET /api/beads/ready` - Ready-to-work tasks
- `GET /api/stats` - System statistics

## Development

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## Implementation Tasks

The dashboard is implemented through 10 beads (tasks):

1. `debussy-dashboard-cus` - Project setup with Next.js, TypeScript, Tailwind
2. `debussy-dashboard-2hc` - Mailbox polling API routes
3. `debussy-dashboard-ltb` - BD CLI integration API routes
4. `debussy-dashboard-3p4` - TypeScript data models and types
5. `debussy-dashboard-cbt` - Navigation and routing structure
6. `debussy-dashboard-d94` - System Status Dashboard component
7. `debussy-dashboard-04y` - Task Pipeline Kanban Board component
8. `debussy-dashboard-5mq` - Task Details View component
9. `debussy-dashboard-2dm` - Real-time updates implementation
10. `debussy-dashboard-wx8` - Metrics Dashboard with charts

Run `bd ready` to see which tasks are ready to implement.

## Usage

### Viewing System Status
Navigate to `/` to see:
- Agent status (running/idle)
- Mailbox queue counts
- Quick statistics
- System health indicators

### Monitoring Task Pipeline
Navigate to `/pipeline` to see:
- Kanban board with columns: Planning → Development → Testing → Review → Integration → Done
- Task cards with bead ID, title, assignee, priority
- Filter by agent, status, or priority

### Task Details
Click any task or navigate to `/task/[bead-id]` to see:
- Complete task information
- Dependencies and blockers
- Status history
- Related messages
- Git branch and commits

### Viewing Metrics
Navigate to `/metrics` to see:
- Tasks completed per day
- Average time per stage
- Agent utilization
- Bottleneck detection
- Historical trends

## Future Enhancements

### Phase 2
- WebSocket integration for instant updates
- Task assignment from UI
- Interactive dependency graph
- Timeline/Gantt view
- Full-text search

### Phase 3
- Git integration with diffs
- Inline code review
- Agent log viewer
- Manual agent control
- Multi-project support

## Troubleshooting

### Dashboard not showing data
- Verify `DEBUSSY_PROJECT_PATH` is correct in `.env.local`
- Check that `.claude/mailbox/` directory exists
- Ensure `bd` CLI is in PATH

### API routes returning errors
- Check file permissions on mailbox directory
- Verify bd CLI is working: `bd list`
- Check console for error messages

### Stale data
- Adjust `POLLING_INTERVAL` in `.env.local`
- Clear browser cache
- Restart development server

## Contributing

See the main Debussy repository for contribution guidelines.

## License

MIT License - See LICENSE file for details

## Related Projects

- [Debussy](https://github.com/tsturo/debussy) - Multi-agent orchestration system
- [Beads](https://github.com/tsturo/beads) - Task management CLI

## Support

For issues and questions:
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review Debussy documentation
- Create an issue in the repository
