# Kanban Drag-Drop API Test Results

## Test Date
2026-01-29

## Test Objective
Verify that drag-drop operations in the Kanban board correctly update bead status via the PATCH /api/beads/:id endpoint.

## Bug Found

### Issue
The API endpoint returns incorrect status after successful PATCH operations.

### Root Cause
The parser in `app/api/beads/[id]/route.ts` (lines 48-51) incorrectly identifies the status symbol:

```typescript
const statusSymbol = line[0];
if (statusSymbol === '●') bead.status = 'in_progress';
if (statusSymbol === '✓') bead.status = 'closed';
```

### Actual Status Symbols
Based on `bd show` and `bd list` output:
- Open: `○` (U+25CB - White Circle)
- In Progress: `◐` (U+25D0 - Circle with Left Half Black)
- Closed: `✓` (U+2713 - Check Mark)

### Evidence

#### Test Case
1. Created test bead: `debussy-dashboard-9hf`
2. Sent PATCH request to update status to `in_progress`
3. CLI confirms status changed:
   ```
   ◐ debussy-dashboard-9hf · Manual Kanban Drag-Drop Verification   [● P2 · IN_PROGRESS]
   ```
4. API GET response incorrectly returns: `{ "bead": { "status": "open" } }`

#### Parser Test Output
```
First char: "◐"
First char code: 9680
Status detection:
  Symbol: ◐
  Is ○? false
  Is ●? false  <-- Parser checks for this
  Is ✓? false
  Is ◐? true   <-- Actual symbol
```

### Impact
- Kanban board drag-drop will not work correctly
- Status changes via API appear to succeed (200 OK) but display wrong state
- Frontend will show incorrect bead positions after drag operations

## Fix Required
Update parser to check for correct status symbols:

**File**: `app/api/beads/[id]/route.ts`
**Lines**: 48-51

```typescript
// Current (WRONG)
if (statusSymbol === '●') bead.status = 'in_progress';

// Should be (CORRECT)
if (statusSymbol === '◐') bead.status = 'in_progress';
```

## Test Environment
- Next.js dev server on port 3000
- bd CLI version: (from project)
- Test bead ID: debussy-dashboard-9hf

## Recommendation
Fix the parser and re-run full drag-drop test suite (`test-kanban-dragdrop.js`) to verify all status transitions work correctly.
