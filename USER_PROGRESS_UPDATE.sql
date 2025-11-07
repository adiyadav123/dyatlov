-- Update user_progress table to include evidence-archive as a valid page
-- This migration adds 'evidence-archive' to the page_visited CHECK constraint

-- Drop the existing constraint
ALTER TABLE user_progress DROP CONSTRAINT "user_progress_page_visited_check";

-- Add the new constraint with the additional page
ALTER TABLE user_progress ADD CONSTRAINT "user_progress_page_visited_check" 
  CHECK (page_visited IN ('newspaper-1959', 'voices-1959', 'soviet-archive', 'evidence'));
