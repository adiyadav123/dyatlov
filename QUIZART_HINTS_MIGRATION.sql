-- QuizArt Hints Table

CREATE TABLE IF NOT EXISTS quizart_hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hint_type TEXT NOT NULL CHECK (hint_type IN ('text', 'image')),
  content TEXT NOT NULL, -- For text hints: the text content, For image hints: the image URL/path
  caption TEXT, -- Optional caption for image hints
  created_by TEXT NOT NULL, -- Admin email who created the hint
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_quizart_hints_active ON quizart_hints(is_active, display_order);

-- Enable Row Level Security
ALTER TABLE quizart_hints ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all to read active hints" ON quizart_hints 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow all operations on quizart_hints" ON quizart_hints 
  FOR ALL USING (true);
