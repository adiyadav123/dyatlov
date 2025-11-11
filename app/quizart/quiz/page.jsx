'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function QuizPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [participantId, setParticipantId] = useState(null)
  const [difficulty, setDifficulty] = useState('easy')
  const [questionNum, setQuestionNum] = useState(1)
  const [answer, setAnswer] = useState('')
  const [riddles, setRiddles] = useState({})
  const [mediumAnswers, setMediumAnswers] = useState({})
  const [hardAnswers, setHardAnswers] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [startTime] = useState(Date.now())

  const maxQuestions = { easy: 10, medium: 5, hard: 5 }

  // Helper function to calculate string similarity (Levenshtein distance)
  const levenshteinDistance = (str1, str2) => {
    const len1 = str1.length
    const len2 = str2.length
    const matrix = []

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        }
      }
    }

    return matrix[len1][len2]
  }

  useEffect(() => {
    initializeQuiz()
  }, [])

  const initializeQuiz = async () => {
    const id = localStorage.getItem('quizart_participant_id')
    if (!id) {
      router.push('/quizart')
      return
    }
    
    setParticipantId(id)
    await Promise.all([
      fetchRiddles(),
      fetchMediumAnswers(),
      fetchHardAnswers()
    ])
    await restoreProgress(id)
    setInitializing(false)
  }

  const restoreProgress = async (id) => {
    try {
      // Get all correct answers to find the last one
      const { data, error } = await supabase
        .from('quizart_progress')
        .select('difficulty, question_number, is_correct, answered_at')
        .eq('participant_id', id)
        .eq('is_correct', true)
        .order('answered_at', { ascending: false })

      console.log('=== RESTORE PROGRESS DEBUG ===')
      console.log('Participant ID:', id)
      console.log('All correct answers:', data)
      console.log('Total correct answers:', data?.length || 0)

      if (error) {
        console.error('Error fetching progress:', error)
        return
      }

      if (!data || data.length === 0) {
        // No correct answers yet, check if they have any attempts
        const { data: attempts } = await supabase
          .from('quizart_progress')
          .select('difficulty, question_number')
          .eq('participant_id', id)
          .order('answered_at', { ascending: false })
          .limit(1)

        console.log('No correct answers. Last attempt:', attempts)

        if (attempts && attempts.length > 0) {
          // They have attempts but no correct answers - stay on the question they're attempting
          setDifficulty(attempts[0].difficulty)
          setQuestionNum(attempts[0].question_number)
        }
        // Otherwise start from beginning (easy Q1)
        return
      }

      // Show all easy questions answered correctly
      const easyCorrect = data.filter(d => d.difficulty === 'easy')
      console.log('Easy questions answered correctly:', easyCorrect.map(d => d.question_number).sort((a, b) => a - b))

      // Find the HIGHEST question number completed for each difficulty (not most recent by time)
      const easyQuestions = data.filter(d => d.difficulty === 'easy').map(d => d.question_number)
      const mediumQuestions = data.filter(d => d.difficulty === 'medium').map(d => d.question_number)
      const hardQuestions = data.filter(d => d.difficulty === 'hard').map(d => d.question_number)

      const maxEasy = easyQuestions.length > 0 ? Math.max(...easyQuestions) : 0
      const maxMedium = mediumQuestions.length > 0 ? Math.max(...mediumQuestions) : 0
      const maxHard = hardQuestions.length > 0 ? Math.max(...hardQuestions) : 0

      console.log('Highest completed - Easy:', maxEasy, 'Medium:', maxMedium, 'Hard:', maxHard)
      
      // Check if quiz is complete (all 20 questions answered correctly)
      if (data.length >= 20) {
        console.log('Quiz completed! Redirecting...')
        router.push('/quizart/complete')
        return
      }
      
      // Determine where to continue based on highest completed question
      if (maxHard > 0 && maxHard < 5) {
        console.log(`Restoring to Hard Q${maxHard + 1}`)
        setDifficulty('hard')
        setQuestionNum(maxHard + 1)
      } else if (maxHard === 5) {
        console.log('All questions completed! Redirecting...')
        router.push('/quizart/complete')
      } else if (maxMedium > 0 && maxMedium < 5) {
        console.log(`Restoring to Medium Q${maxMedium + 1}`)
        setDifficulty('medium')
        setQuestionNum(maxMedium + 1)
      } else if (maxMedium === 5) {
        console.log('Starting Hard Q1')
        setDifficulty('hard')
        setQuestionNum(1)
      } else if (maxEasy > 0 && maxEasy < 10) {
        console.log(`Restoring to Easy Q${maxEasy + 1}`)
        setDifficulty('easy')
        setQuestionNum(maxEasy + 1)
      } else if (maxEasy === 10) {
        console.log('Starting Medium Q1')
        setDifficulty('medium')
        setQuestionNum(1)
      } else {
        // No progress, start from beginning
        console.log('No progress found, starting from Easy Q1')
        setDifficulty('easy')
        setQuestionNum(1)
      }
    } catch (err) {
      console.error('Failed to restore progress:', err)
    }
  }

  const fetchRiddles = async () => {
    try {
      // Add timestamp to prevent caching
      const res = await fetch(`/api/assets?file=quizart/easy/riddle.json&t=${Date.now()}`)
      const data = await res.json()
      setRiddles(data)
    } catch (err) {
      console.error('Failed to load riddles')
    }
  }

  const fetchMediumAnswers = async () => {
    try {
      const res = await fetch(`/api/assets?file=quizart/medium/answers.json&t=${Date.now()}`)
      const data = await res.json()
      setMediumAnswers(data)
      console.log('Medium answers loaded:', data)
    } catch (err) {
      console.error('Failed to load medium answers')
    }
  }

  const fetchHardAnswers = async () => {
    try {
      const res = await fetch(`/api/assets?file=quizart/hard/answers.json&t=${Date.now()}`)
      const data = await res.json()
      setHardAnswers(data)
      console.log('Hard answers loaded:', data)
    } catch (err) {
      console.error('Failed to load hard answers')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    setLoading(true)

    let correctAnswer = ''
    let isCorrect = false

    if (difficulty === 'easy') {
      correctAnswer = riddles[`answer${questionNum}`]
      const currentRiddle = riddles[`riddle${questionNum}`]
      
      console.log('Checking answer with AI:', { userAnswer: answer.trim(), correctAnswer, riddle: currentRiddle })
      
      // Use Gemini AI to check answer for easy questions
      try {
        const response = await fetch('/api/check-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAnswer: answer.trim(),
            correctAnswer: correctAnswer,
            riddle: currentRiddle
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API error:', response.status, errorText)
          throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        isCorrect = result.isCorrect
        
        // Show reason in console for debugging
        console.log('AI Answer check result:', result)
      } catch (err) {
        console.error('AI check failed, using fuzzy match:', err)
        // Fallback to fuzzy comparison if AI fails
        const userLower = answer.trim().toLowerCase()
        const correctLower = (correctAnswer || '').toLowerCase()
        
        // Check if they're very similar (allow 1-2 character differences)
        isCorrect = userLower === correctLower || 
                   userLower.includes(correctLower) || 
                   correctLower.includes(userLower) ||
                   levenshteinDistance(userLower, correctLower) <= 2
        
        console.log('Fuzzy match result:', isCorrect)
      }
    } else {
      // For medium and hard, load answer from respective JSON files
      const questionKeys = ['first', 'second', 'third', 'fourth', 'fifth']
      const questionKey = questionKeys[questionNum - 1]
      
      if (difficulty === 'medium') {
        correctAnswer = mediumAnswers[questionKey]?.answer || ''
        console.log('Medium answer check:', { questionKey, correctAnswer })
      } else if (difficulty === 'hard') {
        correctAnswer = hardAnswers[questionKey]?.answer || ''
        console.log('Hard answer check:', { questionKey, correctAnswer })
      }
      
      // Clean answer - remove notes in parentheses
      const cleanCorrectAnswer = correctAnswer.split('(')[0].trim()
      
      console.log('Checking answer with AI:', { userAnswer: answer.trim(), correctAnswer: cleanCorrectAnswer })
      
      // Use Gemini AI to check answer for medium and hard questions too
      try {
        const response = await fetch('/api/check-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAnswer: answer.trim(),
            correctAnswer: cleanCorrectAnswer,
            riddle: `${difficulty.toUpperCase()} Question ${questionNum}`
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API error:', response.status, errorText)
          throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        isCorrect = result.isCorrect
        
        console.log('AI Answer check result:', result)
      } catch (err) {
        console.error('AI check failed, using fuzzy match:', err)
        // Fallback to fuzzy comparison if AI fails
        const userLower = answer.trim().toLowerCase()
        const correctLower = cleanCorrectAnswer.toLowerCase()
        
        // Check if they're very similar (allow 1-2 character differences)
        isCorrect = userLower === correctLower || 
                   userLower.includes(correctLower) || 
                   correctLower.includes(userLower) ||
                   levenshteinDistance(userLower, correctLower) <= 2
        
        console.log('Fuzzy match result:', isCorrect)
      }
    }

    try {
      // Check if this question was already attempted
      const { data: existingAttempt } = await supabase
        .from('quizart_progress')
        .select('id, is_correct')
        .eq('participant_id', participantId)
        .eq('difficulty', difficulty)
        .eq('question_number', questionNum)
        .single()

      let insertResult
      
      if (existingAttempt) {
        // Update existing attempt
        console.log('Updating existing attempt for Q', questionNum)
        insertResult = await supabase
          .from('quizart_progress')
          .update({
            answer: answer.trim(),
            is_correct: isCorrect,
            answered_at: new Date().toISOString()
          })
          .eq('id', existingAttempt.id)
      } else {
        // Insert new attempt
        console.log('Inserting new attempt for Q', questionNum)
        insertResult = await supabase
          .from('quizart_progress')
          .insert([{
            participant_id: participantId,
            difficulty,
            question_number: questionNum,
            answer: answer.trim(),
            is_correct: isCorrect
          }])
      }

      if (insertResult.error) {
        console.error('Error saving progress:', insertResult.error)
        setFeedback('Error saving progress. Please try again.')
        setLoading(false)
        return
      }

      console.log('Progress saved:', { difficulty, questionNum, isCorrect })

      if (isCorrect && (!existingAttempt || !existingAttempt.is_correct)) {
        // Only update score if this is a new correct answer (not already correct)
        // Points: Easy=+2, Medium=+3, Hard=+5
        const points = { easy: 2, medium: 3, hard: 5 }
        const pointsToAdd = points[difficulty]
        
        const scoreField = `${difficulty}_score`
        const { data: currentScore, error: scoreError } = await supabase
          .from('quizart_scores')
          .select(`${scoreField}, total_score`)
          .eq('participant_id', participantId)
          .single()

        if (scoreError) {
          console.error('Error fetching score:', scoreError)
        }

        const newDifficultyScore = (currentScore?.[scoreField] || 0) + pointsToAdd
        const newTotalScore = (currentScore?.total_score || 0) + pointsToAdd

        const updateResult = await supabase
          .from('quizart_scores')
          .update({ 
            [scoreField]: newDifficultyScore,
            total_score: newTotalScore
          })
          .eq('participant_id', participantId)

        if (updateResult.error) {
          console.error('Error updating score:', updateResult.error)
        }

        console.log('Score updated:', {
          difficulty,
          pointsAdded: pointsToAdd,
          newDifficultyScore,
          newTotalScore
        })
      }

      setFeedback(isCorrect ? 'Correct! 🎉' : 'Incorrect ❌ Try again!')
      
      if (isCorrect) {
        // Wait 1.5s for user to see feedback, then reload progress
        setTimeout(async () => {
          console.log('Correct answer! Reloading progress from database...')
          setAnswer('')
          setFeedback(null)
          
          // Small delay to ensure database write is committed
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Reload current position from database to ensure consistency
          await restoreProgress(participantId)
          setLoading(false)
        }, 1500)
      } else {
        // Wrong answer - allow them to try again
        setLoading(false)
        setTimeout(() => {
          setFeedback(null)
          setAnswer('')
        }, 2000)
      }
    } catch (err) {
      setFeedback('Error submitting answer')
      setLoading(false)
    }
  }

  const completeQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const { data: scores } = await supabase
      .from('quizart_scores')
      .select('*')
      .eq('participant_id', participantId)
      .single()

    const totalScore = (scores.easy_score || 0) + (scores.medium_score || 0) + (scores.hard_score || 0)

    await supabase
      .from('quizart_scores')
      .update({ total_score: totalScore, time_taken: timeTaken })
      .eq('participant_id', participantId)

    router.push('/quizart/complete')
  }

  if (initializing || !participantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading quiz...</div>
      </div>
    )
  }

  const currentRiddle = difficulty === 'easy' ? riddles[`riddle${questionNum}`] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="text-white">
            <div className="flex items-center gap-2">
              <span className="text-purple-300 text-sm uppercase">{difficulty}</span>
              {difficulty === 'easy' && (
                <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded border border-blue-400/50">
                  🤖 AI Checked
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold">Question {questionNum} / {maxQuestions[difficulty]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/quizart/view-hints')}
              className="px-4 py-2 bg-white/10 backdrop-blur border border-white/30 rounded-lg text-white hover:bg-white/20 text-sm"
            >
              💡 Hints
            </button>
            <button
              onClick={() => router.push('/quizart/leaderboard')}
              className="px-4 py-2 bg-white/10 backdrop-blur border border-white/30 rounded-lg text-white hover:bg-white/20 text-sm"
            >
              🏆 Leaderboard
            </button>
            <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white text-sm">
              Total Progress: {(difficulty === 'easy' ? questionNum : difficulty === 'medium' ? 10 + questionNum : 15 + questionNum)} / 20
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${difficulty}-${questionNum}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <div className="mb-6 relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-gray-800">
              <Image
                src={`/api/assets?file=quizart/${difficulty}/${questionNum}.jpg`}
                alt={`Question ${questionNum}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {currentRiddle && (
              <div className="mb-6 bg-purple-500/20 border border-purple-400 rounded-lg p-4">
                <p className="text-purple-100 text-lg italic">{currentRiddle}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                disabled={loading || feedback}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {feedback && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`p-4 rounded-lg text-center font-bold ${feedback.includes('Correct') ? 'bg-green-500/20 border border-green-400 text-green-200' : 'bg-red-500/20 border border-red-400 text-red-200'}`}
                >
                  {feedback}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || feedback || !answer.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
              >
                {loading ? (difficulty === 'easy' ? 'Checking with AI...' : 'Submitting...') : 'Submit Answer'}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
