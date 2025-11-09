'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MedicalRecordsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const participantType = localStorage.getItem('participantType')
      if (!participantType) {
        router.push('/register')
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"
          />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <Lock className="w-16 h-16 text-red-500" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-3">ASSET LOCKED</h1>
        <p className="text-neutral-400 mb-6">
          This section is currently under restricted access. Medical examination records are not available at this time.
        </p>
        
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-neutral-300">
            🔒 <span className="font-semibold">Access Denied</span> - The forensic records vault remains classified. Continue your investigation through other available resources.
          </p>
        </motion.div>
        
        <button
          onClick={() => router.push('/start')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
        >
          Back to Investigation
        </button>
      </motion.div>
    </div>
  )
}
