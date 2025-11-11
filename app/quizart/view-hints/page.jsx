'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export default function ViewHintsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [hints, setHints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHints()
  }, [])

  const fetchHints = async () => {
    try {
      const { data, error } = await supabase
        .from('quizart_hints')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setHints(data || [])
    } catch (err) {
      console.error('Failed to fetch hints:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">💡 Quiz Hints</h1>
          <p className="text-purple-200">Helpful clues for the quiz</p>
        </motion.div>

        <div className="mb-6 text-center">
          <button
            onClick={() => router.push('/quizart')}
            className="px-4 py-2 bg-white/10 backdrop-blur border border-white/30 rounded-lg text-white hover:bg-white/20"
          >
            ← Back to Quiz
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading hints...</div>
        ) : hints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No hints available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {hints.map((hint, index) => (
              <motion.div
                key={hint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        {hint.hint_type === 'text' ? (
                          <p className="text-base text-gray-800 leading-relaxed">{hint.content}</p>
                        ) : (
                          <div>
                            <div className="relative w-full max-w-md mb-2 rounded-lg overflow-hidden">
                              <img 
                                src={hint.content} 
                                alt="Hint image" 
                                className="w-full h-auto max-h-48 object-contain bg-gray-100"
                              />
                            </div>
                            {hint.caption && (
                              <p className="text-sm text-gray-600 italic">{hint.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
