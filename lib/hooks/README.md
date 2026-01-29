# Real-Time Data Hooks

TanStack Query hooks for polling and reactive data updates.

## Usage

### Beads

```typescript
import { useBeads, useReadyBeads, useBead } from '@/lib/hooks';

const { data, isLoading, error, isError } = useBeads(3000);
const beads = data?.beads || [];

const { data: readyData } = useReadyBeads(3000);
const readyBeads = readyData?.beads || [];

const { data: bead } = useBead(beadId, 3000);
```

### Mailbox

```typescript
import { useMailbox, useAgentMailbox } from '@/lib/hooks';

const { data } = useMailbox(3000);
const agents = data?.agents || [];
const totalMessages = data?.total_messages || 0;

const { data: agentData } = useAgentMailbox('developer', 3000);
const messages = agentData?.messages || [];
```

### Stats

```typescript
import { useStats } from '@/lib/hooks';

const { data } = useStats(5000);
const stats = data?.system_state;
```

## Configuration

Default polling intervals:
- Beads: 3s
- Mailbox: 3s
- Stats: 5s

All hooks support custom intervals passed as parameter.

## Error Handling

All hooks return standard TanStack Query response:
- `data`: Response data
- `isLoading`: Initial loading state
- `isError`: Error state
- `error`: Error object

Automatic retry with exponential backoff is configured globally.
