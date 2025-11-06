-- Create user_progress table to track page visits and investigation progress
CREATE TABLE IF NOT EXISTS user_progress (
  id BIGSERIAL PRIMARY KEY,
  participant_id UUID NOT NULL,
  participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('individual', 'team')),
  page_visited VARCHAR(50) NOT NULL CHECK (page_visited IN ('newspaper-1959', 'voices-1959', 'soviet-archive')),
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  
  UNIQUE(participant_id, page_visited),
  
  
  CONSTRAINT valid_participant_type CHECK (participant_type IN ('individual', 'team'))
);

-- Create index for faster queries
CREATE INDEX idx_user_progress_participant_id ON user_progress(participant_id);
CREATE INDEX idx_user_progress_participant_type ON user_progress(participant_type);
CREATE INDEX idx_user_progress_page_visited ON user_progress(page_visited);
CREATE INDEX idx_user_progress_visited_at ON user_progress(visited_at);

-- Enable RLS (Row Level Security)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public access (if needed)
-- Allow anyone to insert their own progress
CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view progress
CREATE POLICY "Users can view progress"
  ON user_progress FOR SELECT
  USING (true);
