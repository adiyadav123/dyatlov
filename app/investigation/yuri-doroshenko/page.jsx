'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function YuriDoroshenko() {
  const router = useRouter()
  const [showDecoder, setShowDecoder] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  // Story reveals Caesar cipher shift of 13 (ROT13)
  // Encoded diary entry at the end
  const encodedMessage = "GUR SVER JNFA'G ZRNAG GB JNEZ HF. JR JRER OHEAVAT RIRELGUVAT."
  // Decoded: "THE FIRE WASN'T MEANT TO WARM US. WE WERE BURNING EVERYTHING."

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = answer.toLowerCase().replace(/[^a-z]/g, '')
    
    // Accept decoded message
    if (cleaned.includes('firewasntmeanttowarm') || 
        cleaned.includes('wewereburneverything') ||
        cleaned.includes('thefirewasntmeanttowarmwewereburning')) {
      localStorage.setItem('unlock_yuri_diary', 'true')
      router.push('/soviet-archive/evidence')
    } else {
      setError('Incorrect decoding. Use the shift mentioned in the story.')
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
            ГЕОРГИЙ АЛЕКСЕЕВИЧ КРИВОНИЩЕНКО
          </h1>
          <p className="text-xl text-gray-400 mb-1">Yuri (Georgiy) Krivonischenko</p>
          <p className="text-sm text-gray-500">23 February 1935 — 27 January 1959</p>
        </motion.div>

        <div className="space-y-6 mt-8">
          {/* The Story */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Nuclear Engineer</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Georgiy Krivonischenko worked at the Mayak nuclear facility, one of the Soviet Union's most classified military installations. 
                In September 1957, he witnessed the Kyshtym disaster—a catastrophic nuclear accident that released massive amounts of radioactive material.
              </p>
              <p>
                The Soviet government ordered a complete information blackout. Anyone who witnessed the accident was sworn to secrecy under threat of imprisonment. 
                Krivonischenko signed documents stating he would never speak of what he saw, using a special code system where each letter was shifted by <span className="text-yellow-400 font-bold">13 positions</span> in the alphabet.
              </p>
              <p>
                Two years later, he joined the Dyatlov expedition. His body was found near a cedar tree with severe burns on his hands and feet. 
                The autopsy revealed something disturbing: his clothing showed traces of beta radiation, and investigators found a partially burned journal entry in his pocket.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Discovery</h2>
            <div className="space-y-4 text-gray-300">
              <div className="border-l-4 border-red-500 pl-4">
                <p className="font-bold text-red-300">Found at Cedar Tree:</p>
                <p>Body discovered 1.5 km from tent, partially undressed despite -30°C temperature</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="font-bold text-yellow-300">Physical Evidence:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Third-degree burns on hands and legs</li>
                  <li>Missing fingertips, skin torn off</li>
                  <li>Radioactive contamination on clothing (beta particles)</li>
                  <li>Evidence of attempting to climb cedar tree</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Last Entry</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                Forensic analysts recovered a fragment from his journal. The text was encoded using the same <span className="text-yellow-400 font-bold">13-position shift cipher</span> he 
                learned at Mayak. This is what they found:
              </p>
              <div className="bg-black/50 p-4 rounded font-mono text-sm border border-red-500">
                <p className="text-red-400 mb-2">RECOVERED JOURNAL FRAGMENT:</p>
                <p className="text-yellow-300 leading-relaxed break-words">
                  {encodedMessage}
                </p>
              </div>
              <button
                onClick={() => setShowDecoder(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded"
              >
                DECODE MESSAGE
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
                Shift each letter back by 13 positions to decode the message.
              </p>
              <p className="text-sm text-gray-400 italic mb-4">
                Hint: A→N, B→O, C→P... or use ROT13 cipher
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter decoded message..."
                  rows="3"
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
