-- Add resolved_at column to support_tickets table to track when tickets were archived/resolved
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries on resolved tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_resolved ON support_tickets(resolved);
CREATE INDEX IF NOT EXISTS idx_support_tickets_resolved_at ON support_tickets(resolved_at);

-- Add comment to explain the column
COMMENT ON COLUMN support_tickets.resolved_at IS 'Timestamp when the ticket was marked as resolved/archived';
