# Agent Mailbox Viewer - Architecture Design

## Overview

A dedicated UI view for browsing and managing agent mailboxes in the Debussy Dashboard. This feature allows users to view all messages across agents, filter by criteria, and see detailed message contents including linked beads.

## User Requirements

Users need to:
- See all messages across all agents in one place
- Filter messages by agent, priority, status (read/unread)
- View detailed message information including sender, recipient, subject, body, timestamp
- Navigate to linked beads from messages
- See message counts and statistics per agent
- Sort messages by different criteria (date, priority, agent)

## Technical Architecture

### Route Structure

```
/mailbox                    # Main mailbox viewer
/mailbox/[agent]           # Agent-specific mailbox (optional)
```

### Component Hierarchy

```
MailboxViewerPage
├── MailboxHeader
│   ├── Title & Stats
│   └── FilterControls
│       ├── AgentFilter (multi-select dropdown)
│       ├── PriorityFilter (checkboxes)
│       └── SearchInput
├── MailboxSidebar (optional, can be toggled)
│   └── AgentList
│       └── AgentMailboxItem (per agent with count)
└── MessageList
    ├── MessageCard
    │   ├── MessageHeader (sender → recipient, timestamp, priority badge)
    │   ├── MessageSubject
    │   ├── MessageBody (expandable/collapsible)
    │   └── MessageActions
    │       ├── ViewBeadButton (if bead_id exists)
    │       └── CopyMessageIdButton
    └── Pagination/InfiniteScroll
```

### Data Models

Already exist in `lib/types/message.ts`:
```typescript
interface Message {
  id: string;
  sender: AgentType;
  recipient: AgentType;
  subject: string;
  body: string;
  bead_id?: string | null;
  priority: number;
  created_at: string;
}

interface AgentMailbox {
  agent: AgentType;
  inbox_count: number;
  messages: Message[];
}
```

### API Integration

Existing endpoints to leverage:
- `GET /api/mailbox` - All agent mailboxes
- `GET /api/mailbox/[agent]` - Specific agent messages

No new API routes needed. Use existing endpoints with client-side filtering.

### State Management

#### URL State (via Next.js searchParams)
```typescript
interface MailboxURLState {
  agents?: string[];          // Filter by agents
  priority?: number[];        // Filter by priority
  search?: string;            // Search in subject/body
  sort?: 'date' | 'priority' | 'agent';
  order?: 'asc' | 'desc';
  page?: number;              // For pagination
}
```

#### Local UI State (React state or Zustand)
```typescript
interface MailboxUIState {
  expandedMessages: Set<string>;     // Message IDs that are expanded
  selectedAgent: AgentType | null;   // Currently selected agent in sidebar
  sidebarOpen: boolean;              // Sidebar visibility
}
```

### Filtering Logic

Client-side filtering pipeline:
1. Fetch all messages from `/api/mailbox`
2. Apply agent filter (if specified)
3. Apply priority filter (if specified)
4. Apply search filter (substring match in subject + body)
5. Sort by selected criteria
6. Paginate results (20 per page)

### Components Specification

#### MailboxViewerPage (`app/mailbox/page.tsx`)
- Fetch mailbox data using `useMailbox` hook
- Manage URL search params for filters
- Coordinate child components
- Handle real-time updates (5s polling)

#### MailboxHeader
Props: `{ totalMessages: number, filteredMessages: number }`
- Display title "Agent Mailboxes"
- Show total message count and filtered count
- Last updated timestamp

#### FilterControls
Props: `{ onFilterChange: (filters: FilterState) => void }`
- Agent multi-select dropdown (with "All" option)
- Priority checkboxes (1-5)
- Search input (debounced, 300ms)
- Sort dropdown (Date, Priority, Agent)
- Clear filters button

#### MessageCard
Props: `{ message: Message, isExpanded: boolean, onToggle: () => void }`
Features:
- Collapsible body (show first 100 chars by default)
- Priority badge with color coding (1=red, 2=orange, 3=yellow, 4=blue, 5=gray)
- Agent names with colors matching AgentStatusCard
- Timestamp in relative format ("2 hours ago")
- Click to expand/collapse
- Link to bead if `bead_id` exists

#### MessageList
Props: `{ messages: Message[], isLoading: boolean }`
- Render list of MessageCard components
- Empty state when no messages
- Loading skeleton
- Infinite scroll or pagination (decide based on performance)

#### MailboxSidebar (optional enhancement)
Props: `{ agents: AgentMailbox[], selectedAgent: AgentType | null, onSelectAgent: (agent) => void }`
- List all agents with inbox counts
- Highlight selected agent
- Badge with unread count
- Toggle button to collapse/expand

### Layout Options

#### Option 1: Full-width with top filters (Recommended)
```
┌─────────────────────────────────────────────────────┐
│ Agent Mailboxes (42 messages, 8 filtered)          │
│ [Agent Filter] [Priority] [Search] [Sort]          │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ MessageCard                                     │ │
│ │ conductor → developer  Priority: 2  2h ago     │ │
│ │ "Implement feature X"                          │ │
│ │ Body preview text...              [View Bead] │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ MessageCard                                     │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

#### Option 2: Sidebar with agent list
```
┌──────────┬───────────────────────────────────────────┐
│ Agents   │ Messages for: All Agents                  │
│          │ [Priority] [Search] [Sort]                │
│ All (42) ├───────────────────────────────────────────┤
│ architect│ ┌───────────────────────────────────────┐ │
│   (5)    │ │ MessageCard                           │ │
│ developer│ └───────────────────────────────────────┘ │
│   (12)   │ ┌───────────────────────────────────────┐ │
│ tester   │ │ MessageCard                           │ │
│   (3)    │ └───────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────┘
```

**Recommendation**: Start with Option 1 (full-width) for simplicity and better mobile responsiveness. Option 2 can be added as an enhancement.

### Styling Approach

Follow existing dashboard patterns:
- Tailwind CSS classes
- Consistent with AgentStatusCard and SystemHealthPanel
- Priority color scheme:
  - Priority 1 (Highest): Red - `bg-red-100 text-red-800 border-red-300`
  - Priority 2 (High): Orange - `bg-orange-100 text-orange-800 border-orange-300`
  - Priority 3 (Medium): Yellow - `bg-yellow-100 text-yellow-800 border-yellow-300`
  - Priority 4 (Low): Blue - `bg-blue-100 text-blue-800 border-blue-300`
  - Priority 5 (Lowest): Gray - `bg-gray-100 text-gray-800 border-gray-300`

- Agent colors (matching existing):
  - conductor: Purple
  - architect: Blue
  - developer/developer2: Green
  - tester: Yellow
  - reviewer: Orange
  - integrator: Red

### Responsive Design

- Desktop (>1024px): Full layout with all filters visible
- Tablet (768-1024px): Collapsed filters into dropdown, full message cards
- Mobile (<768px): Stacked layout, simplified message cards, bottom sheet for filters

### Performance Considerations

#### Pagination Strategy
- Initial load: Show 20 messages
- Infinite scroll: Load 20 more when scrolling near bottom
- Total messages in memory: Max 100 (older messages pruned)

#### Search Optimization
- Debounce search input (300ms)
- Client-side search using `fuse.js` for fuzzy matching
- Index fields: subject, body, sender, recipient

#### Caching
- Leverage existing TanStack Query cache (5s stale time)
- No additional caching needed

### Accessibility

- Keyboard navigation (Tab through messages, Enter to expand)
- ARIA labels for screen readers
- Focus management for modals/dropdowns
- Semantic HTML (proper heading hierarchy)
- Color contrast compliance (WCAG AA)

### Future Enhancements (Not in MVP)

1. **Mark as Read/Unread**: Track read status in localStorage
2. **Archive Messages**: Move messages to archived state
3. **Message Threading**: Group related messages by bead_id
4. **Export**: Download messages as JSON/CSV
5. **Real-time Notifications**: Toast when new messages arrive
6. **Message Search History**: Save recent searches
7. **Bulk Actions**: Select multiple messages for batch operations
8. **Message Details Modal**: Full-screen view with more context

## Implementation Plan

### Phase 1: Core Structure (Essential)
1. Create `app/mailbox/page.tsx` with basic layout
2. Add MailboxHeader component with title and stats
3. Add FilterControls component (agent filter only)
4. Create MessageCard component (collapsed view)
5. Create MessageList component
6. Integrate with existing `/api/mailbox` endpoint
7. Add to navigation menu

### Phase 2: Filtering & Sorting
1. Implement priority filter
2. Add search functionality with debouncing
3. Add sort options (date, priority, agent)
4. Implement URL state management

### Phase 3: Polish
1. Add expand/collapse for message bodies
2. Link to bead details page
3. Add empty states and loading skeletons
4. Responsive design adjustments
5. Add pagination or infinite scroll

### Phase 4: Enhancements (Optional)
1. Add sidebar with agent list (Option 2 layout)
2. Keyboard shortcuts
3. Export functionality
4. Advanced search (regex support)

## File Structure

```
app/
  mailbox/
    page.tsx                    # Main page component

components/
  mailbox/
    MailboxViewerPage.tsx       # Container component
    MailboxHeader.tsx           # Header with stats
    FilterControls.tsx          # Filter/search/sort controls
    MessageList.tsx             # List container
    MessageCard.tsx             # Individual message card
    PriorityBadge.tsx           # Reusable priority badge
    AgentBadge.tsx              # Reusable agent badge

lib/
  hooks/
    useMailboxFilters.ts        # Custom hook for filter state
  utils/
    messageFilters.ts           # Filter/sort utility functions
    messageSearch.ts            # Search functionality
```

## Dependencies

Existing dependencies are sufficient:
- `@tanstack/react-query` - Data fetching
- `tailwindcss` - Styling
- Next.js built-in routing

Optional (for future enhancements):
- `fuse.js` - Fuzzy search (if needed)
- `date-fns` - Date formatting (or use native Intl)

## Testing Strategy

1. **Unit Tests**:
   - Filter functions (`messageFilters.ts`)
   - Search functions (`messageSearch.ts`)
   - Component rendering (MessageCard, FilterControls)

2. **Integration Tests**:
   - Full mailbox page with filters applied
   - Navigation between mailbox and bead details
   - API integration with `/api/mailbox`

3. **Manual Testing**:
   - Test with 0, 1, 10, 100+ messages
   - Test all filter combinations
   - Test search with various queries
   - Test responsive design on different screen sizes

## Success Metrics

- Users can view all messages in under 2 seconds
- Filter/search provides results in under 500ms
- Page handles 100+ messages without performance degradation
- All filters work correctly and can be combined
- Links to beads work correctly
- Responsive design works on mobile/tablet/desktop

## Open Questions

1. Should message bodies support markdown rendering? (Recommendation: Yes, using `react-markdown`)
2. Should we track read/unread status? (Recommendation: Phase 2, use localStorage)
3. Pagination vs Infinite Scroll? (Recommendation: Infinite scroll for better UX)
4. Should deleted messages be shown? (Recommendation: No, only show inbox messages)

## Risk Assessment

- **Low Risk**: Using existing API endpoints, no new backend work
- **Medium Risk**: Performance with large message counts (mitigated by pagination)
- **Low Risk**: UI complexity manageable with component breakdown

## Timeline Estimate

- Phase 1 (Core): 1 bead
- Phase 2 (Filtering): 1 bead
- Phase 3 (Polish): 1 bead
- Total: 3 beads for full MVP implementation

## Conclusion

This design provides a comprehensive mailbox viewer that integrates seamlessly with the existing Debussy Dashboard architecture. It follows established patterns, requires no new API development, and can be implemented incrementally in phases.
