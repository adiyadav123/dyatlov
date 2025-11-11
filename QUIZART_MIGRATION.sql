-- QuizArt Database Schema

-- Participants table
CREATE TABLE IF NOT EXISTS quizart_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class INTEGER NOT NULL CHECK (class >= 3 AND class <= 7),
  section TEXT NOT NULL CHECK (section IN ('A', 'B', 'C', 'D', 'E')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz progress table
CREATE TABLE IF NOT EXISTS quizart_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES quizart_participants(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_number INTEGER NOT NULL,
  answer TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, difficulty, question_number)
);

-- Scores table
CREATE TABLE IF NOT EXISTS quizart_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES quizart_participants(id) ON DELETE CASCADE UNIQUE,
  easy_score INTEGER DEFAULT 0,
  medium_score INTEGER DEFAULT 0,
  hard_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  time_taken INTEGER, -- in seconds
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizart_progress_participant ON quizart_progress(participant_id);
CREATE INDEX IF NOT EXISTS idx_quizart_scores_total ON quizart_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_quizart_participants_class ON quizart_participants(class, section);

-- Enable Row Level Security
ALTER TABLE quizart_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizart_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizart_scores ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on quizart_participants" ON quizart_participants FOR ALL USING (true);
CREATE POLICY "Allow all operations on quizart_progress" ON quizart_progress FOR ALL USING (true);
CREATE POLICY "Allow all operations on quizart_scores" ON quizart_scores FOR ALL USING (true);
