# Setup Instructions for Ticket Read Tracking

## Problem
Messages were showing as "NEW" every time the page was reloaded because there was no persistent tracking of which messages users had already seen.

## Solution
Created a `ticket_reads` table in the database to track when each user last viewed each ticket.

## Steps to Implement

### 1. Run the SQL Migration

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Click: **New Query**
4. Copy the entire contents of `TICKET_READS_MIGRATION.sql`
5. Paste into the SQL editor
6. Click: **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

### 2. Verify the Table was Created

1. Go to: **Table Editor** in Supabase
2. Look for: `ticket_reads` table
3. Check columns exist:
   - `id` (UUID, Primary Key)
   - `ticket_id` (UUID)
   - `participant_id` (UUID)
   - `team_id` (UUID)
   - `participant_type` (TEXT)
   - `last_read_at` (TIMESTAMPTZ)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

### 3. Test the Feature

1. **Create or view a support ticket** with admin responses
2. **Reload the page** - NEW badges should disappear
3. **Ask admin to send new message** - NEW badge should appear
4. **Open the ticket** - wait 1 second
5. **Reload** - NEW badge should be gone

## How It Works

### Database Storage
```
ticket_reads table:
- Stores one row per user per ticket
- Updates `last_read_at` timestamp when user views ticket
- Uses UNIQUE constraint to prevent duplicates
```

### Read Tracking Flow
1. User opens ticket → waits 1 second → marks as read
2. Upsert into `ticket_reads` with current timestamp
3. Future message checks compare `message.created_at > last_read_at`
4. Only newer messages show "NEW" badge

### Unread Count Calculation
```sql
SELECT COUNT(*) FROM ticket_messages 
WHERE ticket_id = ? 
  AND sender_type = 'admin' 
  AND created_at > (SELECT last_read_at FROM ticket_reads WHERE ...)
```

## Features

✅ **Persistent across devices** - Uses database, not localStorage
✅ **Real-time updates** - Checks every 8 seconds for new messages
✅ **Unread badges** - Red count on ticket list
✅ **NEW badges** - Only on truly unread admin messages
✅ **Optimistic UI** - Messages appear instantly when sent
✅ **Auto-mark as read** - 1 second after opening ticket

## Troubleshooting

### Issue: "NEW" badges still showing on old messages
**Fix:** Wait 1 second after opening ticket, then reload page

### Issue: Unread counts not showing
**Fix:** Check Supabase logs for RLS policy errors

### Issue: "relation ticket_reads does not exist"
**Fix:** Re-run the SQL migration script

### Issue: Duplicate constraint errors
**Fix:** Table already exists - check if migration ran twice
