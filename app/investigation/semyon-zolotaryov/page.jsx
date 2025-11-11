'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SemyonZolotaryov() {
  const router = useRouter()
  const [showDecoder, setShowDecoder] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  // Morse code message: "NOT HIS REAL NAME"
  const morseMessage = "-. --- -   .... .. ...   .-. . .- .-..   -. .- -- ."

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = answer.toLowerCase().replace(/[^a-z]/g, '')
    
    if (cleaned === 'nothisrealname' || cleaned === 'nothisname' || cleaned === 'nothisreal') {
      localStorage.setItem('unlock_semyon_diary', 'true')
      router.push('/soviet-archive/evidence')
    } else {
      setError('Incorrect. Decode the morse signal.')
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
            СЕМЁН АЛЕКСЕЕВИЧ ЗОЛОТАРЁВ
          </h1>
          <p className="text-xl text-gray-400">Semyon (Alexander) Zolotaryov</p>
          <p className="text-sm text-gray-500">2 February 1921 — February 1959</p>
        </motion.div>

        <div className="space-y-6 mt-8">
          {/* The Story */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Mysterious Veteran</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                At 37 years old, Semyon Zolotaryov was by far the oldest member of the expedition—nearly twice the age of most hikers. 
                This raised immediate questions: Why would a World War II veteran with mysterious tattoos join a student hiking trip?
              </p>
              <p>
                His background was deliberately obscure. Official records show he fought in the Red Army during World War II, 
                but his service record contains numerous redactions and classified stamps. He claimed to be a hiking instructor, 
                yet he joined the group only days before departure with no prior connection to any of the students.
              </p>
              <p>
                Fellow hikers noted his evasive answers about his past. When asked about his tattoos—including a distinctive chest piece 
                with five wounds arranged like Christ's stigmata—he would change the subject. He carried expensive equipment, 
                including a camera far beyond what a typical instructor could afford.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Intelligence Connections</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Declassified KGB documents from 1991 revealed something shocking: "Semyon Zolotaryov" was not his real name. 
                He had been operating under at least three different identities since 1945.
              </p>
              <div className="border-l-4 border-yellow-500 pl-4 mt-4">
                <p className="font-bold text-yellow-300">Known Aliases:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Alexander Zolotaryov (birth name, possibly false)</li>
                  <li>Semyon Alekseevich Zolotaryov (primary identity)</li>
                  <li>Sasha Z. (used in military correspondence)</li>
                </ul>
              </div>
              <p className="mt-4">
                His military file contains references to "special assignments" in East Germany and classified work with military intelligence. 
                He spoke fluent German and knew <span className="text-yellow-400 font-bold">Morse code</span>—a skill typically reserved for radio operators and intelligence officers.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Autopsy</h2>
            <div className="space-y-4 text-gray-300">
              <div className="border-l-4 border-red-500 pl-4">
                <p className="font-bold text-red-300">Body Location:</p>
                <p>Found in ravine with Lyudmila Dubinina, wearing her coat</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 mt-4">
                <p className="font-bold text-red-300">Injuries:</p>
                <ul className="list-disc list-inside">
                  <li>Fractured ribs and skull</li>
                  <li>Missing eyes</li>
                  <li>Massive internal trauma</li>
                </ul>
              </div>
              <div className="bg-red-900/30 p-4 rounded mt-4 border border-red-500">
                <p className="text-sm italic">
                  "The deceased's identity could not be positively confirmed. Dental records do not match any known Semyon Zolotaryov. 
                  The tattoos suggest military service, possibly special operations. Recommendation: Refer to military intelligence for verification."
                </p>
                <p className="text-xs text-gray-500 mt-2">— Investigation Report, March 26, 1959</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">The Hidden Message</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                In his camera, investigators found an undeveloped roll of film. When processed, most images showed normal hiking scenes. 
                But the final frame was peculiar—a photograph of a hand-drawn chart with what appeared to be radio signal patterns.
              </p>
              <p className="text-gray-300">
                A KGB cryptographer later identified the patterns as <span className="text-yellow-400 font-bold">Morse code</span>. 
                The message was tapped out in a sequence that suggests it was written moments before his death.
              </p>
              <div className="bg-black/50 p-4 rounded font-mono text-sm border border-red-500">
                <p className="text-red-400 mb-2">MORSE CODE FROM FINAL PHOTOGRAPH:</p>
                <p className="text-yellow-300 text-lg leading-relaxed">
                  {morseMessage}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  ( • = dit/dot, — = dah/dash, space between letters, larger space between words)
                </p>
              </div>
              <button
                onClick={() => setShowDecoder(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded"
              >
                DECODE MORSE SIGNAL
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
                Decode the Morse code message to unlock access to Semyon's field notes.
              </p>
              <p className="text-sm text-gray-400 italic mb-4">
                Hint: Use International Morse Code. A=•—, N=—•, etc.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter decoded message..."
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
