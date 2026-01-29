# Kanban Drag-Drop Backend Test Results

**Test Date**: 2026-01-29
**Tester**: @tester
**Bead**: debussy-dashboard-uo0
**Status**: ❌ FAILED - Critical Bug Found

## Test Objective

Verify that Kanban board drag-drop functionality correctly updates bead status via the API:
1. API receives PATCH requests correctly
2. Bead status changes in the backend database
3. Changes persist on page refresh

## Test Methodology

Created an automated test script (`test-kanban-dragdrop.js`) that:
1. Creates a test bead with status "open"
2. Simulates drag to "development" stage (PATCH request with status: "in_progress")
3. Verifies the change via both API GET and CLI
4. Simulates drag to "completed" stage (PATCH request with status: "closed")
5. Verifies final state persists

## Test Results

### ❌ FAILED: Status Update Parsing Bug

**Issue Found**: The API endpoint `/api/beads/:id` has a parsing bug that prevents it from correctly reading the status of beads with `in_progress` status.

**Root Cause**: `app/api/beads/[id]/route.ts:48-51`

The parser only checks for these status symbols:
- `○` → open
- `●` → in_progress
- `✓` → closed

However, `bd show` output uses `◐` (half-filled circle) for in_progress beads, which is NOT matched by the regex pattern `^[○●✓]`.

**Evidence**:

```bash
# Actual bd show output for in_progress bead:
$ bd show debussy-dashboard-4na
◐ debussy-dashboard-4na · Test Kanban Drag-Drop   [● P2 · IN_PROGRESS]

# API incorrectly returns:
$ curl http://localhost:3000/api/beads/debussy-dashboard-4na | jq '.bead.status'
"open"

# Expected:
"in_progress"
```

### Test Execution Details

```
1. Creating test bead...
   ✓ Created test bead: debussy-dashboard-4na

2. Verifying initial status via CLI...
   ✓ Initial status: open (expected: open)

3. Getting bead via API (GET /api/beads/:id)...
   ✓ API returned status 200
   ✓ Bead status from API: open

4. Simulating drag to "development" stage...
   ✓ API returned status 200
   ❌ FAILED: API returned status "open" instead of "in_progress"
```

## Impact Assessment

**Severity**: 🔴 CRITICAL

**User Impact**:
- Kanban board appears to update when cards are dragged
- Backend actually updates the status correctly (verified via `bd show`)
- API GET requests return stale/incorrect status
- Page refresh shows incorrect status
- Users cannot trust the Kanban board state

**Affected Components**:
- `/app/pipeline/page.tsx` - Kanban board
- `/app/api/beads/[id]/route.ts` - PATCH and GET endpoints
- Any component that reads bead status via the API

## Recommended Fix

Update the parser in `app/api/beads/[id]/route.ts`:

**Option 1**: Add `◐` to the regex pattern
```typescript
if (line.match(/^[○●◐✓]\s+\S+\s+·/)) {
  const statusSymbol = line[0];
  if (statusSymbol === '●' || statusSymbol === '◐') bead.status = 'in_progress';
  if (statusSymbol === '✓') bead.status = 'closed';
```

**Option 2** (More robust): Parse from the status text in brackets
```typescript
// Look for [● P2 · IN_PROGRESS] or [● P2 · OPEN] or [● P2 · CLOSED]
const statusMatch = line.match(/\[(.*?·\s*(OPEN|IN_PROGRESS|CLOSED))\]/i);
if (statusMatch) {
  const status = statusMatch[2].toLowerCase();
  if (status === 'in_progress') bead.status = 'in_progress';
  if (status === 'closed') bead.status = 'closed';
  if (status === 'open') bead.status = 'open';
}
```

## Files to Fix

- `app/api/beads/[id]/route.ts` - parseBeadShow function (lines 29-143)

## Next Steps

1. Fix the parsing bug in `app/api/beads/[id]/route.ts`
2. Re-run the test to verify fix
3. Add additional test cases for all status transitions
4. Consider adding unit tests for the parser function

## Test Artifacts

- Test script: `test-kanban-dragdrop.js`
- Test bead: debussy-dashboard-4na (cleaned up)
