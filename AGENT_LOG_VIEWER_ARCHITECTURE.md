# Agent Log Viewer Architecture

## Overview

Design for a comprehensive agent log viewer feature that allows viewing, filtering, and searching logs from all agents (conductor, architect, developer, developer2, tester, reviewer, integrator).

## Architecture Components

### 1. Log Storage Structure

**Location**: `.claude/logs/`

**Directory Structure**:
```
.claude/
└── logs/
    ├── conductor/
    ├── architect/
    ├── developer/
    ├── developer2/
    ├── tester/
    ├── reviewer/
    └── integrator/
```

**Log File Format**:
- JSON Lines format (`.jsonl`) - one JSON object per line
- Rotating files: `YYYY-MM-DD.jsonl`
- Each log entry is a complete JSON object

**Log Entry Schema**:
```typescript
interface LogEntry {
  id: string;                    // log-{timestamp}-{random}
  timestamp: string;             // ISO 8601 format
  agent: AgentType;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'system' | 'task' | 'communication' | 'error' | 'performance';
  message: string;
  context?: {
    bead_id?: string;
    message_id?: string;
    file_path?: string;
    line_number?: number;
    duration_ms?: number;
    [key: string]: any;
  };
  metadata?: {
    session_id?: string;
    correlation_id?: string;
    tags?: string[];
  };
}
```

### 2. API Endpoints

Following existing patterns in `/app/api/`:

#### GET `/api/logs`
**Purpose**: Get logs from all agents with filtering

**Query Parameters**:
- `agent` (optional): Filter by agent name
- `level` (optional): Filter by log level
- `category` (optional): Filter by category
- `from` (optional): Start timestamp (ISO 8601)
- `to` (optional): End timestamp (ISO 8601)
- `search` (optional): Text search in message
- `limit` (optional): Max entries (default: 100, max: 1000)
- `offset` (optional): Pagination offset

**Response**:
```typescript
{
  logs: LogEntry[];
  total: number;
  filtered: number;
  agents: AgentType[];
  timestamp: string;
}
```

#### GET `/api/logs/[agent]`
**Purpose**: Get logs from specific agent

**Query Parameters**: Same as above (except `agent`)

**Response**:
```typescript
{
  agent: AgentType;
  logs: LogEntry[];
  count: number;
  timestamp: string;
}
```

#### GET `/api/logs/stream`
**Purpose**: Server-Sent Events endpoint for real-time log streaming (optional enhancement)

**Implementation Pattern**:
- Read `.jsonl` files from disk
- Parse and filter based on query parameters
- Sort by timestamp (descending - newest first)
- Apply pagination
- Cache parsed results for 2 seconds (like existing endpoints)

### 3. Data Fetching Hooks

**Location**: `/lib/hooks/useLogs.ts`

```typescript
export function useLogs(
  filters?: LogFilters,
  refetchInterval: number = 5000
): UseQueryResult<LogsResponse, Error>

export function useAgentLogs(
  agent: AgentType,
  filters?: LogFilters,
  refetchInterval: number = 5000
): UseQueryResult<AgentLogsResponse, Error>

interface LogFilters {
  level?: LogLevel | LogLevel[];
  category?: LogCategory | LogCategory[];
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
```

### 4. UI Components

**Location**: `/components/logs/`

#### LogViewerPage (`/components/logs/LogViewerPage.tsx`)
- Main page component
- Manages filter state
- Handles agent selection
- Displays log statistics
- Dark mode support

#### LogFilterControls (`/components/logs/LogFilterControls.tsx`)
- Agent selector (multi-select)
- Log level filter (debug, info, warn, error)
- Category filter
- Date/time range picker
- Search input
- Clear filters button

#### LogList (`/components/logs/LogList.tsx`)
- Virtual scrolling for performance (react-window or similar)
- Displays filtered logs
- Handles pagination
- Auto-scroll to bottom toggle
- Export functionality (CSV/JSON)

#### LogEntry (`/components/logs/LogEntry.tsx`)
- Individual log entry display
- Color-coded by level:
  - debug: gray
  - info: blue
  - warn: yellow
  - error: red
- Expandable for context/metadata
- Timestamp formatting (relative + absolute)
- Link to related bead/message if present
- Copy to clipboard button

#### LogStats (`/components/logs/LogStats.tsx`)
- Total logs count
- Breakdown by level
- Breakdown by agent
- Activity timeline chart (using recharts)

### 5. Type Definitions

**Location**: `/lib/types/logs.ts`

```typescript
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogCategory =
  | 'system'           // System events, startup, shutdown
  | 'task'             // Task-related activities
  | 'communication'    // Inter-agent messages
  | 'error'            // Errors and exceptions
  | 'performance';     // Performance metrics

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: AgentType;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: LogContext;
  metadata?: LogMetadata;
}

export interface LogContext {
  bead_id?: string;
  message_id?: string;
  file_path?: string;
  line_number?: number;
  duration_ms?: number;
  [key: string]: any;
}

export interface LogMetadata {
  session_id?: string;
  correlation_id?: string;
  tags?: string[];
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  filtered: number;
  agents: AgentType[];
  timestamp: string;
}

export interface AgentLogsResponse {
  agent: AgentType;
  logs: LogEntry[];
  count: number;
  timestamp: string;
}
```

### 6. Utility Functions

**Location**: `/lib/utils/logFilters.ts`

```typescript
export function filterLogs(
  logs: LogEntry[],
  filters: LogFilters
): LogEntry[]

export function searchLogs(
  logs: LogEntry[],
  query: string
): LogEntry[]

export function sortLogs(
  logs: LogEntry[],
  order: 'asc' | 'desc'
): LogEntry[]

export function formatLogTimestamp(
  timestamp: string,
  format: 'relative' | 'absolute' | 'full'
): string

export function getLogLevelColor(level: LogLevel): string

export function exportLogsToCSV(logs: LogEntry[]): string

export function exportLogsToJSON(logs: LogEntry[]): string
```

### 7. Navigation & Routing

**Page Route**: `/app/logs/page.tsx`

**Navigation Entry**:
- Add "Logs" link to Navigation component
- Icon: Console/Terminal icon
- Position: After "Metrics"

**URL Structure**:
- `/logs` - All logs
- `/logs?agent=conductor` - Specific agent
- `/logs?level=error` - Filter by level
- `/logs?category=task` - Filter by category

## Implementation Details

### Phase 1: Foundation (debussy-dashboard-mln)
1. Create type definitions in `/lib/types/logs.ts`
2. Create log directory structure `.claude/logs/[agent]/`
3. Add validation functions to `/lib/utils/validation.ts`
4. Create utility functions in `/lib/utils/logFilters.ts`

### Phase 2: API Layer (debussy-dashboard-wxz)
1. Implement `/app/api/logs/route.ts` (GET all logs)
2. Implement `/app/api/logs/[agent]/route.ts` (GET agent logs)
3. Add log reading/parsing logic
4. Add error handling and validation
5. Create data fetching hooks in `/lib/hooks/useLogs.ts`

### Phase 3: UI Components (debussy-dashboard-7mq)
1. Create LogEntry component with styling
2. Create LogList component with virtual scrolling
3. Create LogFilterControls component
4. Create LogStats component
5. Create LogViewerPage component
6. Add dark mode support (using existing ThemeContext)

### Phase 4: Integration (debussy-dashboard-cwl)
1. Create `/app/logs/page.tsx`
2. Add "Logs" to Navigation component
3. Test all filtering and searching functionality
4. Ensure responsive design
5. Add export functionality

## Technical Considerations

### Performance
- Virtual scrolling for large log lists (1000+ entries)
- Pagination with limit/offset
- Client-side caching via TanStack Query (5s stale time)
- Server-side filtering to reduce payload size

### Storage
- Rotating log files by day
- Keep last 30 days (configurable)
- Compress old logs (gzip)
- Max file size: 10MB per agent per day

### Real-time Updates
- Polling interval: 5 seconds (consistent with existing patterns)
- Optional: SSE endpoint for true real-time streaming
- Auto-scroll to bottom option for monitoring

### Error Handling
- Graceful degradation if log files don't exist
- Handle malformed JSON lines
- Validate log entry schema
- Display user-friendly error messages

### Security
- No authentication in current system
- Logs stored locally only
- Sanitize file paths
- Validate all query parameters

## Future Enhancements

1. **Real-time Streaming**: Implement SSE endpoint for live log updates
2. **Log Aggregation**: Combine logs from multiple agents in timeline view
3. **Advanced Search**: Regex support, fuzzy search
4. **Log Levels**: Add trace/fatal levels
5. **Structured Logging**: Support for structured data beyond JSON
6. **Log Retention Policy**: Automatic cleanup of old logs
7. **Download All**: Bulk export functionality
8. **Bookmarks**: Save frequent filter combinations
9. **Notifications**: Alert on error-level logs
10. **Performance Metrics**: Add performance dashboard from log data

## Dependencies

Follows existing patterns in codebase:
- Next.js API Routes (no additional deps)
- TanStack Query (already installed)
- Recharts (already installed for charts)
- Tailwind CSS (already installed)
- TypeScript (already configured)

Optional additions:
- `react-window` or `react-virtuoso` for virtual scrolling
- `date-fns` for date/time manipulation (if not already present)

## Testing Strategy

1. Unit tests for utility functions (filters, formatters)
2. Integration tests for API endpoints
3. Component tests for UI elements
4. E2E tests for complete log viewing workflow
5. Performance tests with large log files (10K+ entries)

## Compliance with Existing Patterns

- ✓ Polling-based data fetching (5s interval)
- ✓ TanStack Query for state management
- ✓ TypeScript throughout
- ✓ Validation functions in utils
- ✓ Structured error responses
- ✓ Dark mode support
- ✓ Component composition pattern
- ✓ Client-side filtering capabilities
- ✓ Consistent API response structure
