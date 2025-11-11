'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CompletePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [participantName, setParticipantName] = useState('')
  const [scores, setScores] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem('quizart_participant_id')
    const name = localStorage.getItem('quizart_participant_name')
    
    if (!id) {
      router.push('/quizart')
      return
    }

    setParticipantName(name)
    fetchScores(id)
  }, [])

  const fetchScores = async (id) => {
    try {
      const { data, error } = await supabase
        .from('quizart_scores')
        .select('*')
        .eq('participant_id', id)
        .single()

      if (error) throw error
      setScores(data)
    } catch (err) {
      console.error('Failed to fetch scores')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} minutes ${secs} seconds`
  }

  const getPercentage = (score, total) => {
    return Math.round((score / total) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading results...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Quiz Completed!</h1>
            <p className="text-purple-200 text-xl">Well done, {participantName}!</p>
          </div>

          {scores && (
            <div className="space-y-6">
              <div className="bg-purple-600/30 rounded-xl p-6 border border-purple-400">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2">{scores.total_score}/60</div>
                  <div className="text-purple-200 text-lg">Total Score</div>
                  <div className="text-yellow-300 text-3xl font-bold mt-2">{getPercentage(scores.total_score, 60)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-500/20 border border-green-400 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white">{scores.easy_score}/20</div>
                  <div className="text-green-200 text-sm">Easy</div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white">{scores.medium_score}/15</div>
                  <div className="text-yellow-200 text-sm">Medium</div>
                </div>
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white">{scores.hard_score}/25</div>
                  <div className="text-red-200 text-sm">Hard</div>
                </div>
              </div>

              

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => router.push('/quizart/leaderboard')}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700"
                >
                  View Leaderboard 🏆
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('quizart_participant_id')
                    localStorage.removeItem('quizart_participant_name')
                    router.push('/quizart')
                  }}
                  className="flex-1 bg-white/10 border border-white/30 text-white font-bold py-3 rounded-lg hover:bg-white/20"
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
