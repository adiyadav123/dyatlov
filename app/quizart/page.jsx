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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function QuizArtHome() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [formData, setFormData] = useState({ name: '', class: '', section: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const participantId = localStorage.getItem('quizart_participant_id')
    if (participantId) {
      router.push('/quizart/quiz')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.name.trim() || !formData.class || !formData.section) {
      setError('Please fill all fields')
      setLoading(false)
      return
    }

    try {
      // Check if participant already exists
      const { data: existing, error: checkError } = await supabase
        .from('quizart_participants')
        .select('id, name')
        .eq('name', formData.name.trim())
        .eq('class', parseInt(formData.class))
        .eq('section', formData.section)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      let participantId, participantName

      if (existing) {
        // User already exists, restore their session
        participantId = existing.id
        participantName = existing.name
        setError('Welcome back! Restoring your session...')
        setTimeout(() => setError(''), 2000)
      } else {
        // Create new participant
        const { data: participant, error: err1 } = await supabase
          .from('quizart_participants')
          .insert([{ name: formData.name.trim(), class: parseInt(formData.class), section: formData.section }])
          .select()
          .single()

        if (err1) throw err1

        // Initialize scores
        await supabase.from('quizart_scores').insert([{
          participant_id: participant.id,
          easy_score: 0,
          medium_score: 0,
          hard_score: 0,
          total_score: 0
        }])

        participantId = participant.id
        participantName = participant.name
      }

      localStorage.setItem('quizart_participant_id', participantId)
      localStorage.setItem('quizart_participant_name', participantName)

      router.push('/quizart/quiz')
    } catch (err) {
      console.error('Registration error:', err)
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🎨 QuizArt</h1>
            <p className="text-purple-200">Image-Based Quiz Challenge</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-purple-200 text-sm mb-2">Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label className="text-purple-200 text-sm mb-2">Class</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                <SelectTrigger className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="bg-purple-900 border-white/30">
                  <SelectItem value="3" className="text-white">Class 3</SelectItem>
                  <SelectItem value="4" className="text-white">Class 4</SelectItem>
                  <SelectItem value="5" className="text-white">Class 5</SelectItem>
                  <SelectItem value="6" className="text-white">Class 6</SelectItem>
                  <SelectItem value="7" className="text-white">Class 7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-purple-200 text-sm mb-2">Section</Label>
              <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                <SelectTrigger className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent className="bg-purple-900 border-white/30">
                  <SelectItem value="A" className="text-white">Section A</SelectItem>
                  <SelectItem value="B" className="text-white">Section B</SelectItem>
                  <SelectItem value="C" className="text-white">Section C</SelectItem>
                  <SelectItem value="D" className="text-white">Section D</SelectItem>
                  <SelectItem value="E" className="text-white">Section E</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg">
              {loading ? 'Loading...' : 'Start Quiz 🚀'}
            </button>
          </form>

          <div className="mt-6 text-center flex justify-center gap-4">
            <button onClick={() => router.push('/quizart/leaderboard')} className="text-purple-300 hover:text-white text-sm underline">
              Leaderboard 🏆
            </button>
            <button onClick={() => router.push('/quizart/view-hints')} className="text-purple-300 hover:text-white text-sm underline">
              Hints 💡
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
