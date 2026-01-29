# Agent Log Viewer - Architecture Summary

**Bead**: debussy-dashboard-wd7 (CLOSED)
**Architect**: @architect
**Date**: 2026-01-29

## Deliverables

### 1. Architecture Document
**File**: `AGENT_LOG_VIEWER_ARCHITECTURE.md`

Comprehensive 300+ line design document covering:
- Log storage structure and schema
- API endpoint specifications
- UI component architecture
- Type definitions
- Data fetching patterns
- Implementation phases
- Performance considerations
- Future enhancements

### 2. Implementation Tasks

Created 4 sequential tasks with proper dependencies:

#### Task 1: Foundation (debussy-dashboard-mln) - READY
**Status**: Open, Ready to start
**Assignee**: developer
**Scope**:
- Create type definitions (`/lib/types/logs.ts`)
- Set up log directory structure (`.claude/logs/[agent]/`)
- Add validation functions
- Create utility functions for filtering/formatting

#### Task 2: API Layer (debussy-dashboard-wxz) - BLOCKED
**Status**: Blocked by mln
**Assignee**: developer
**Scope**:
- Implement `/api/logs` endpoint (all logs)
- Implement `/api/logs/[agent]` endpoint (agent-specific)
- Create TanStack Query hooks
- Add error handling and validation

#### Task 3: UI Components (debussy-dashboard-7mq) - BLOCKED
**Status**: Blocked by wxz
**Assignee**: developer
**Scope**:
- Create LogViewerPage component
- Create LogFilterControls component
- Create LogList with virtual scrolling
- Create LogEntry component
- Create LogStats component
- Add dark mode support

#### Task 4: Integration (debussy-dashboard-cwl) - BLOCKED
**Status**: Blocked by 7mq
**Assignee**: developer
**Scope**:
- Create `/app/logs/page.tsx` route
- Add to Navigation component
- Test functionality
- Ensure responsive design

## Key Design Decisions

### 1. Log Storage
- **Format**: JSON Lines (`.jsonl`) - one JSON per line
- **Location**: `.claude/logs/[agent]/YYYY-MM-DD.jsonl`
- **Rotation**: Daily files
- **Retention**: 30 days (configurable)

### 2. Log Entry Schema
```typescript
interface LogEntry {
  id: string;
  timestamp: string;
  agent: AgentType;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'system' | 'task' | 'communication' | 'error' | 'performance';
  message: string;
  context?: { bead_id?, message_id?, file_path?, duration_ms?, ... };
  metadata?: { session_id?, correlation_id?, tags? };
}
```

### 3. API Design
- **Pattern**: Next.js API Routes (consistent with existing endpoints)
- **Filtering**: Query params for agent, level, category, date range, search
- **Pagination**: limit/offset params (default 100, max 1000)
- **Caching**: 2-5 seconds via TanStack Query
- **Polling**: 5 second intervals

### 4. UI Features
- Multi-agent log viewing
- Comprehensive filtering (agent, level, category, date, search)
- Virtual scrolling for performance (1000+ entries)
- Color-coded by log level
- Expandable entries for context/metadata
- Export to CSV/JSON
- Dark mode support
- Responsive design

## Patterns Followed

✓ Next.js API Routes for backend
✓ TanStack Query for data fetching
✓ TypeScript throughout
✓ Polling-based real-time updates
✓ Component composition pattern
✓ Dark mode via existing ThemeContext
✓ Validation utilities in `/lib/utils/`
✓ Type definitions in `/lib/types/`
✓ Structured error responses

## Performance Considerations

- Virtual scrolling for large lists
- Client-side caching (5s stale time)
- Server-side filtering to reduce payload
- Pagination support
- File-based storage (no database required)

## Next Steps

1. Developer starts with **debussy-dashboard-mln** (Foundation)
2. Once mln is complete, proceed to **debussy-dashboard-wxz** (API)
3. Once wxz is complete, proceed to **debussy-dashboard-7mq** (UI)
4. Once 7mq is complete, proceed to **debussy-dashboard-cwl** (Integration)

## Dependencies Chain

```
mln (Foundation)
  ↓ blocks
wxz (API)
  ↓ blocks
7mq (UI)
  ↓ blocks
cwl (Integration)
```

## Files to Review

1. `AGENT_LOG_VIEWER_ARCHITECTURE.md` - Full architecture document
2. Existing codebase patterns:
   - `/app/api/mailbox/route.ts` - API endpoint pattern
   - `/lib/hooks/useMailbox.ts` - Data fetching pattern
   - `/components/mailbox/MailboxViewerPage.tsx` - Page component pattern
   - `/lib/types/mailbox.ts` - Type definition pattern

## Estimated Complexity

- **Foundation** (mln): Simple - type definitions and directory setup
- **API** (wxz): Medium - file parsing and filtering logic
- **UI** (7mq): Complex - multiple components with interactions
- **Integration** (cwl): Simple - routing and navigation updates

## Notes for Implementation

- No additional dependencies required (all tools already in place)
- Optional: Consider `react-window` for virtual scrolling if performance issues arise
- Log files are local only (no remote storage)
- No authentication/authorization required (consistent with current system)
- Follow existing code style and patterns throughout
