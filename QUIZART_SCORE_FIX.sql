-- Fix QuizArt scores to reflect new point system
-- Easy: 2 points, Medium: 3 points, Hard: 5 points

-- Update all scores based on correct answers
UPDATE quizart_scores
SET 
  -- Count correct answers for each difficulty and multiply by points
  easy_score = (
    SELECT COUNT(*) * 2
    FROM quizart_progress
    WHERE quizart_progress.participant_id = quizart_scores.participant_id
      AND quizart_progress.difficulty = 'easy'
      AND quizart_progress.is_correct = true
  ),
  medium_score = (
    SELECT COUNT(*) * 3
    FROM quizart_progress
    WHERE quizart_progress.participant_id = quizart_scores.participant_id
      AND quizart_progress.difficulty = 'medium'
      AND quizart_progress.is_correct = true
  ),
  hard_score = (
    SELECT COUNT(*) * 5
    FROM quizart_progress
    WHERE quizart_progress.participant_id = quizart_scores.participant_id
      AND quizart_progress.difficulty = 'hard'
      AND quizart_progress.is_correct = true
  );

-- Update total_score as sum of all difficulty scores
UPDATE quizart_scores
SET total_score = easy_score + medium_score + hard_score;

-- Show results
SELECT 
  p.name,
  p.class,
  p.section,
  s.easy_score,
  s.medium_score,
  s.hard_score,
  s.total_score,
  (SELECT COUNT(*) FROM quizart_progress WHERE participant_id = p.id AND is_correct = true AND difficulty = 'easy') as easy_correct,
  (SELECT COUNT(*) FROM quizart_progress WHERE participant_id = p.id AND is_correct = true AND difficulty = 'medium') as medium_correct,
  (SELECT COUNT(*) FROM quizart_progress WHERE participant_id = p.id AND is_correct = true AND difficulty = 'hard') as hard_correct
FROM quizart_participants p
LEFT JOIN quizart_scores s ON s.participant_id = p.id
ORDER BY s.total_score DESC;
