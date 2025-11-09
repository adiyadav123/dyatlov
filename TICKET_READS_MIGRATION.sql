-- Create ticket_reads table to track when users last viewed each ticket
CREATE TABLE IF NOT EXISTS ticket_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    participant_id UUID,
    team_id UUID,
    participant_type TEXT NOT NULL CHECK (participant_type IN ('individual', 'team')),
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per ticket per participant
    UNIQUE(ticket_id, participant_id, team_id, participant_type)
);

-- Create index for faster lookups
CREATE INDEX idx_ticket_reads_ticket ON ticket_reads(ticket_id);
CREATE INDEX idx_ticket_reads_participant ON ticket_reads(participant_id);
CREATE INDEX idx_ticket_reads_team ON ticket_reads(team_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_reads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ticket_reads_timestamp
    BEFORE UPDATE ON ticket_reads
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_reads_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE ticket_reads ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own ticket reads
CREATE POLICY "Users can view their own ticket reads"
    ON ticket_reads FOR SELECT
    USING (true);

-- Policy to allow users to insert their own ticket reads
CREATE POLICY "Users can insert their own ticket reads"
    ON ticket_reads FOR INSERT
    WITH CHECK (true);

-- Policy to allow users to update their own ticket reads
CREATE POLICY "Users can update their own ticket reads"
    ON ticket_reads FOR UPDATE
    USING (true);

COMMENT ON TABLE ticket_reads IS 'Tracks when participants last read each support ticket';
COMMENT ON COLUMN ticket_reads.last_read_at IS 'Timestamp when the user last viewed this ticket';
