'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, User, Lock, Eye, AlertTriangle, ChevronRight } from 'lucide-react'

export default function VoicesPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [discoveredClues, setDiscoveredClues] = useState([])

  // Track progress on page load
  useEffect(() => {
    const trackProgress = async () => {
      const participantId = localStorage.getItem('participantId')
      const teamId = localStorage.getItem('teamId')
      const participantType = localStorage.getItem('participantType')

      if (!participantId && !teamId) {
        router.push('/register')
        return
      }

      const id = participantType === 'team' ? teamId : participantId

      try {
        const response = await fetch('/api/progress/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: id,
            participantType,
            pageVisited: 'voices-1959',
          }),
        })

        if (!response.ok) {
          console.error('[Voices] Failed to track progress:', response.statusText)
        }
      } catch (err) {
        console.error('[Voices] Error tracking progress:', err)
      }

      setMounted(true)
    }

    trackProgress()
  }, [router])

  useEffect(() => {
    const participantType = localStorage.getItem('participantType')
    if (!participantType) {
      router.push('/register')
    }
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-stone-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

const diaryEntries = [
  {
    id: 'P-01',
    date: 'January 23, 1959',
    location: 'Ivdel',
    content: `The mountains call to those who listen.
Today we begin. Nine of us, united by curiosity and perhaps foolishness. The cold doesn't frighten me. It's the silence I fear.

The kind of silence that follows screaming.

But I'm being dramatic. Igor says we'll be fine. We've prepared for everything.

Haven't we?`,
    mood: 'Anxious'
  },
  {
    id: 'P-02',
    date: 'January 25, 1959',
    location: '2nd Northern Settlement',
    content: `Something feels off about P-09.
Not wrong, just... absent.
Like he's watching us from somewhere else.

Zina says I'm imagining things.
Maybe I am.
But his eyes don't match his smile.`,
    mood: 'Concerned'
  },
  {
    id: 'P-06',
    date: 'January 28, 1959',
    location: 'Mountain Base',
    content: `Three days from the pass.
The others joke and sing.
But P-09 doesn't sing anymore.

Yesterday he told me he hears voices.
Not from the wind.
From inside.

I asked him what they say.
He said: "They say I should protect us."

From what?

He wouldn't answer.`,
    mood: 'Worried'
  },
  {
    id: 'P-07',
    date: 'January 31, 1959',
    location: 'Altitude 900m',
    content: `Last night, P-09 drew symbols in the snow.
When I asked what they meant, he said:
"Insurance. In case I forget."

Forget what?

He's scaring me now.`,
    mood: 'Fearful'
  },
  {
    id: 'P-09',
    date: 'February 1, 1959',
    location: 'Camp',
    content: `They're talking about me again.
I can hear them even when they whisper.
They think I don't know.
But the other one knows. He always knows.

Mother told me: when reality blurs, follow the puzzles back.

I'm leaving tomorrow.
Igor says it's for the best.

Is it?

I don't remember asking to leave.
But it must have been me.
Who else would it be?`,
    mood: 'Confused',
    highlighted: true
  }
]
 
  const markClue = (clue) => {
    if (!discoveredClues.includes(clue)) {
      setDiscoveredClues([...discoveredClues, clue])
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold mb-1">
                VOICES FROM 1959
              </h1>
              <p className="text-sm text-neutral-400 italic">
                A Digital Archive of Lost Words
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-500">Archive Status</div>
              <div className="text-sm font-medium text-green-400">DECLASSIFIED</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-yellow-200 mb-1">Privacy Notice</h3>
              <p className="text-xs text-yellow-300/80 leading-relaxed">
                Patient identities have been anonymized per USSR medical privacy protocols. 
                All references use Patient ID codes (P-01 through P-09). Names have been redacted 
                to protect families.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quote */}
        <div className="mb-8 p-6 bg-[#1a1a1b] border-l-4 border-white/20 rounded-r-lg">
          <p className="text-sm italic text-neutral-400 leading-relaxed">
            "Every word written in these pages was real. Every entry was a heartbeat. 
            Until it wasn't."
          </p>
        </div>

        {/* Diary Entries */}
        <div className="space-y-4">
          {diaryEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-[#1a1a1b] border rounded-lg overflow-hidden transition-all ${
                entry.highlighted 
                  ? 'border-red-500/30 shadow-lg shadow-red-500/10' 
                  : 'border-white/10'
              }`}
            >
              {/* Entry Header */}
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-transparent to-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-mono text-sm font-bold px-2.5 py-1 rounded ${
                        entry.highlighted 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-white/10 text-neutral-300'
                      }`}>
                        {entry.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {entry.date}
                      </div>
                      <div className="text-xs text-neutral-500">•</div>
                      <div className="text-xs text-neutral-400">{entry.location}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                        Mood: {entry.mood}
                      </span>
                    </div>
                  </div>

                  {entry.highlighted && (
                    <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded text-[10px] font-bold text-red-300 uppercase tracking-wide">
                      Anomaly Detected
                    </div>
                  )}
                </div>
              </div>

              {/* Entry Content */}
              <div className="p-5">
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-line font-serif">
                    {entry.content}
                  </p>
                </div>

                {/* Clue Markers for P-09 Entry */}
                {entry.id === 'P-09' && (
                  <div className="mt-6 p-4 bg-[#272729] border border-white/10 rounded-lg">
                    <p className="text-xs text-neutral-400 mb-3">
                      🔍 <strong className="text-white">Investigator Notes:</strong>
                    </p>
                    <div className="space-y-2 text-xs">
                      <button
                        onClick={() => markClue('other-one')}
                        className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-white/20 transition-all"
                      >
                        <span className={discoveredClues.includes('other-one') ? 'text-green-400' : 'text-neutral-400'}>
                          {discoveredClues.includes('other-one') ? '✓' : '•'} "The other one knows" - Split personality reference?
                        </span>
                      </button>
                      <button
                        onClick={() => markClue('puzzles')}
                        className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-white/20 transition-all"
                      >
                        <span className={discoveredClues.includes('puzzles') ? 'text-green-400' : 'text-neutral-400'}>
                          {discoveredClues.includes('puzzles') ? '✓' : '•'} Mother's puzzles - Cross-ref: /family-letters
                        </span>
                      </button>
                      <button
                        onClick={() => markClue('leaving')}
                        className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-white/20 transition-all"
                      >
                        <span className={discoveredClues.includes('leaving') ? 'text-green-400' : 'text-neutral-400'}>
                          {discoveredClues.includes('leaving') ? '✓' : '•'} "I don't remember asking to leave" - Memory loss?
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Next Steps Guide */}
        <div className="mt-8 p-6 bg-[#1a1a1b] border border-white/10 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <Eye className="w-5 h-5 text-[#0079D3] mt-0.5" />
            <div>
              <h3 className="text-sm font-bold mb-2">Cross-Reference These Clues</h3>
              <div className="space-y-2 text-xs text-neutral-400">
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-[#0079D3]" />
                  <p>
                    <strong className="text-white">P-09's mental state:</strong> Multiple entries mention 
                    unusual behavior. Search for medical records at <code className="text-[#0079D3]">/medical-records</code>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-[#0079D3]" />
                  <p>
                    <strong className="text-white">"The other one":</strong> Reference to split personality. 
                    Check psychiatric records at <code className="text-[#0079D3]">/psychiatric-ward</code>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-[#0079D3]" />
                  <p>
                    <strong className="text-white">Mother's puzzles:</strong> Family history might reveal more. 
                    Visit <code className="text-[#0079D3]">/family-letters</code>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-[#0079D3]" />
                  <p>
                    <strong className="text-white">Voices P-09 heard:</strong> Audio evidence may exist. 
                    Try <code className="text-[#0079D3]">/audio-vault</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Source Code Hidden Hint */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-neutral-500 italic text-center">
              💡 Tip: Check the page source code (Ctrl+U / Cmd+U) for hidden investigator notes
            </p>
          </div>
        </div>

        {/* Clue Counter */}
        {discoveredClues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
          >
            <p className="text-sm text-green-300">
              ✓ You've marked <strong>{discoveredClues.length}</strong> clue(s) from this page
            </p>
          </motion.div>
        )}

      </div>

    </div>
  )
}
