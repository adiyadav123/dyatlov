'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function GeorgiyKrivonischenko() {
  const router = useRouter()
  const [showDecoder, setShowDecoder] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  // Hexadecimal spells "RADIATION" 
  const hexMessage = "52 41 44 49 41 54 49 4F 4E"
  // R=52, A=41, D=44, I=49, A=41, T=54, I=49, O=4F, N=4E

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = answer.toLowerCase().replace(/[^a-z]/g, '')
    
    if (cleaned === 'radiation' || cleaned === 'radioactive') {
      localStorage.setItem('unlock_georgiy_diary', 'true')
      router.push('/soviet-archive/evidence')
    } else {
      setError('Incorrect. Convert hex to ASCII.')
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
            ЮРИЙ АЛЕКСЕЕВИЧ ДОРОШЕНКО
          </h1>
          <p className="text-xl text-gray-400">Georgiy (Yuri) Doroshenko</p>
          <p className="text-sm text-gray-500">29 January 1938 — 1 February 1959</p>
        </motion.div>

        <div className="space-y-6 mt-8">
          {/* The Story */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Youngest Victim</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                At just 21 years old, Yuri Doroshenko was one of the youngest members of the expedition. A fourth-year economics student 
                at the Ural Polytechnic Institute, he was known for his strength and enthusiasm. His friends described him as fearless, 
                always eager to take on challenging routes.
              </p>
              <p>
                What few people knew was that Doroshenko had been working part-time as a laboratory assistant at the Ural Physics Institute, 
                handling materials for classified defense research. The work required security clearance and exposure to experimental equipment.
              </p>
              <p>
                In December 1958, just weeks before the expedition, he was involved in an accident at the lab. Official records state 
                it was minor, but his medical file shows treatment for "acute exposure syndrome"—a condition typically associated with 
                ionizing radiation.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Cedar Tree</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Search teams found Doroshenko's body on February 27, 1959, alongside Georgiy Krivonischenko near a large cedar tree, 
                approximately 1.5 kilometers from the abandoned tent. Both men were partially undressed despite temperatures around -30°C.
              </p>
              <div className="border-l-4 border-red-500 pl-4 mt-4">
                <p className="font-bold text-red-300">Physical Evidence:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Severe hypothermia (primary cause of death)</li>
                  <li>Third-degree burns on hands and feet</li>
                  <li>Torn fingernails and damaged fingertips</li>
                  <li>Burns on face and hair</li>
                  <li>Evidence of attempting to climb the cedar tree</li>
                </ul>
              </div>
              <p className="mt-4">
                The most disturbing discovery came during the forensic analysis of his clothing. His jacket and pants showed 
                significant traces of beta particles—clear evidence of radioactive contamination.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Cover-Up</h2>
            <div className="space-y-4 text-gray-300">
              <div className="bg-red-900/30 p-4 rounded border border-red-500">
                <p className="text-sm italic">
                  "Samples from the deceased's clothing show beta-particle radiation levels 5x above background. 
                  The contamination pattern is inconsistent with environmental exposure. Request immediate investigation 
                  into source. Recommend quarantine of all recovered materials."
                </p>
                <p className="text-xs text-gray-500 mt-2">— Forensic Lab Report #159-03, April 1959</p>
              </div>
              <p className="mt-4">
                This report was immediately classified. The lead investigator, Lev Ivanov, later stated that he was ordered by 
                regional authorities to close the case and attribute deaths to "hypothermia." When he protested, citing the unexplained 
                injuries and radioactive evidence, he was removed from the investigation.
              </p>
              <p>
                In 1990, after the fall of the Soviet Union, Ivanov gave an interview revealing that he had been forced to suppress evidence. 
                He mentioned finding a notebook with Doroshenko's final entry—written in <span className="text-yellow-400 font-bold">hexadecimal code</span>, 
                a numbering system used in early computer science and military equipment.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Final Code</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                The notebook entry was discovered in Doroshenko's inner pocket, partially protected from the elements. 
                The last page contained a single word encoded in hexadecimal—a base-16 numbering system where each pair of digits 
                represents one ASCII character.
              </p>
              <p className="text-gray-300">
                Forensic analysis suggests it was written in extreme distress, possibly his final conscious act. The message may explain 
                what really killed them.
              </p>
              <div className="bg-black/50 p-4 rounded font-mono text-sm border border-red-500">
                <p className="text-red-400 mb-2">RECOVERED FROM NOTEBOOK - HEXADECIMAL CODE:</p>
                <p className="text-yellow-300 text-lg leading-relaxed tracking-wider">
                  {hexMessage}
                </p>
                <p className="text-gray-400 text-xs mt-3">
                  Each pair of hex digits (00-FF) represents one ASCII character
                </p>
              </div>
              <button
                onClick={() => setShowDecoder(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded"
              >
                DECODE HEXADECIMAL
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
                Convert the hexadecimal values to ASCII characters to reveal Doroshenko's final word.
              </p>
              <p className="text-sm text-gray-400 italic mb-4">
                Hint: 41=A, 42=B, 43=C... Each pair of hex digits = one letter
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
