'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LyudmilaDubinina() {
  const router = useRouter()
  const [showDecoder, setShowDecoder] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  // Binary code spells "TONGUE" (what was missing from her body)
  const binaryMessage = "01010100 01001111 01001110 01000111 01010101 01000101"
  // T=84=01010100, O=79=01001111, N=78=01001110, G=71=01000111, U=85=01010101, E=69=01000101

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = answer.toLowerCase().replace(/[^a-z]/g, '')
    
    if (cleaned === 'tongue') {
      localStorage.setItem('unlock_lyudmila_diary', 'true')
      router.push('/soviet-archive/evidence')
    } else {
      setError('Incorrect. Decode the binary sequence.')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-black text-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <button
          onClick={() => router.push('/soviet-archive/evidence')}
          className="mb-6 text-red-400 hover:text-red-300"
        >
          ← Back
        </button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold mb-2 text-red-500">
            ЛЮДМИЛА АЛЕКСАНДРОВНА ДУБИНИНА
          </h1>
          <p className="text-xl text-gray-400">Lyudmila Dubinina</p>
          <p className="text-sm text-gray-500">12 May 1938 — February 1959</p>
        </motion.div>

        <div className="space-y-6 mt-8">
          {/* The Story */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Economics Student</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Lyudmila Dubinina was 20 years old, studying economics at the Ural Polytechnic Institute. 
                She was known for her cheerful personality and love of outdoor adventures. She had participated in multiple expeditions before joining Igor Dyatlov's group.
              </p>
              <p>
                Her diary entries from the trip were filled with optimism and excitement about reaching the mountain. 
                In her last entry on January 31st, she wrote about hearing strange sounds at night—"like a radio signal, but rhythmic, in patterns of eight."
              </p>
              <p>
                When searchers found her body in May 1959, they were horrified. She was discovered in a ravine, 75 meters from the cedar tree, 
                buried under 4 meters of snow. The autopsy revealed catastrophic injuries that would haunt investigators for decades.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Autopsy Report</h2>
            <div className="space-y-4 text-gray-300">
              <div className="border-l-4 border-red-500 pl-4">
                <p className="font-bold text-red-300">Cause of Death:</p>
                <p>Massive internal trauma and hemorrhage</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="font-bold text-yellow-300">Injuries Documented:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Fractured ribs (force equivalent to high-speed car crash)</li>
                  <li>Massive internal bleeding in the chest cavity</li>
                  <li>Both eyes missing from sockets</li>
                  <li className="text-red-400 font-bold">Tongue completely removed, including hyoid bone</li>
                  <li>Soft facial tissue gone</li>
                  <li>No external wounds—trauma was entirely internal</li>
                </ul>
              </div>
              <div className="bg-red-900/30 p-4 rounded mt-4 border border-red-500">
                <p className="text-sm italic text-gray-300">
                  "The absence of the tongue and surrounding tissue presents a medical impossibility under normal circumstances. 
                  The precision of the removal suggests it was not caused by scavenging animals or decomposition. 
                  This tissue was removed while the victim was still alive or immediately post-mortem."
                </p>
                <p className="text-xs text-gray-500 mt-2">— Dr. Boris Vozrozhdenny, Chief Medical Examiner</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Final Message</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                Investigators found something peculiar in her diary—the last page contained a sequence that didn't match her handwriting. 
                It appeared to be written in extreme distress, with ink smudged by what the forensic team identified as tears and blood.
              </p>
              <p className="text-gray-300">
                The message was encoded in <span className="text-yellow-400 font-bold">binary format</span>—groups of 8 digits (8 bits = 1 byte). 
                Each group represents an ASCII character. This encoding method was known only to radio operators and computer engineers in 1959.
              </p>
              <div className="bg-black/50 p-4 rounded font-mono text-sm border border-red-500">
                <p className="text-red-400 mb-2">LAST PAGE - DECODED FROM DIARY:</p>
                <p className="text-yellow-300 leading-relaxed">
                  {binaryMessage}
                </p>
              </div>
              <button
                onClick={() => setShowDecoder(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded"
              >
                DECODE BINARY MESSAGE
              </button>
            </div>
          </div>

          {showDecoder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-linear-to-br from-red-900/50 to-black border-2 border-red-500 rounded-lg p-6"
            >
              <h3 className="text-2xl font-bold mb-4 text-red-400">🔓 DECODE TO UNLOCK</h3>
              <p className="text-gray-300 mb-2">
                Convert each 8-bit binary sequence to its ASCII character.
              </p>
              <p className="text-sm text-gray-400 italic mb-4">
                Hint: Each group of 8 digits equals one letter. The answer relates to what was missing from her body.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter decoded word..."
                  className="w-full p-3 bg-slate-900 border border-red-500 rounded text-white"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded">
                  UNLOCK DIARY
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
