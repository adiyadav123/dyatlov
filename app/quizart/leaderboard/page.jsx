'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function LeaderboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [leaderboard, setLeaderboard] = useState([])
  const [filterClass, setFilterClass] = useState('all')
  const [filterSection, setFilterSection] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [filterClass, filterSection])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('quizart_scores')
        .select(`
          *,
          participant:quizart_participants(name, class, section)
        `)
        .order('total_score', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      let filtered = data.filter(item => item.participant)

      if (filterClass !== 'all') {
        filtered = filtered.filter(item => item.participant.class === parseInt(filterClass))
      }

      if (filterSection !== 'all') {
        filtered = filtered.filter(item => item.participant.section === filterSection)
      }

      setLeaderboard(filtered)
    } catch (err) {
      console.error('Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-purple-200">QuizArt Champions</p>
        </motion.div>

        <div className="mb-6 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => router.push('/quizart')}
            className="px-4 py-2 bg-white/10 backdrop-blur border border-white/30 rounded-lg text-white hover:bg-white/20"
          >
            ← Back to Quiz
          </button>

          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[180px] bg-white/10 backdrop-blur border-white/30 text-white">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="bg-purple-900 border-white/30">
              <SelectItem value="all" className="text-white">All Classes</SelectItem>
              <SelectItem value="3" className="text-white">Class 3</SelectItem>
              <SelectItem value="4" className="text-white">Class 4</SelectItem>
              <SelectItem value="5" className="text-white">Class 5</SelectItem>
              <SelectItem value="6" className="text-white">Class 6</SelectItem>
              <SelectItem value="7" className="text-white">Class 7</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-[180px] bg-white/10 backdrop-blur border-white/30 text-white">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent className="bg-purple-900 border-white/30">
              <SelectItem value="all" className="text-white">All Sections</SelectItem>
              <SelectItem value="A" className="text-white">Section A</SelectItem>
              <SelectItem value="B" className="text-white">Section B</SelectItem>
              <SelectItem value="C" className="text-white">Section C</SelectItem>
              <SelectItem value="D" className="text-white">Section D</SelectItem>
              <SelectItem value="E" className="text-white">Section E</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-600/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-bold">Rank</th>
                    <th className="px-4 py-3 text-left text-white font-bold">Name</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Class</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Section</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Easy</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Medium</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Hard</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-purple-200">
                        No participants yet
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <motion.tr
                        key={entry.participant_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-t border-white/10 hover:bg-white/5 ${index < 3 ? 'bg-yellow-500/10' : ''}`}
                      >
                        <td className="px-4 py-3 text-white font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </td>
                        <td className="px-4 py-3 text-white">{entry.participant.name}</td>
                        <td className="px-4 py-3 text-center text-purple-200">{entry.participant.class}</td>
                        <td className="px-4 py-3 text-center text-purple-200">{entry.participant.section}</td>
                        <td className="px-4 py-3 text-center text-green-300">{entry.easy_score}/20</td>
                        <td className="px-4 py-3 text-center text-yellow-300">{entry.medium_score}/15</td>
                        <td className="px-4 py-3 text-center text-red-300">{entry.hard_score}/25</td>
                        <td className="px-4 py-3 text-center text-white font-bold">{entry.total_score}/60</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
