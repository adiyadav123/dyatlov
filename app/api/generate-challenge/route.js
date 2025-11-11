import { GoogleGenerativeAI } from '@google/generative-ai'
import { challengeStore } from '../challenge-store.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { itemId, itemTitle, itemType, currentLayer, totalLayers, storyContext, puzzleType } = await request.json()
    
    // Generate puzzle based on type
    const puzzles = {
      cipher: {
        question: `<div class="font-mono bg-gray-900 text-green-400 p-4 rounded">
          <p class="mb-2">// ENCRYPTED MESSAGE FRAGMENT</p>
          <p class="text-lg">Zskt wkgx: <span class="text-yellow-400">TKIX</span></p>
          <p class="mt-4 text-xs text-gray-500">Hint: Shift by 15</p>
        </div>
        <p class="mt-4">What year does this decrypt to?</p>`,
        answer: '1959',
        hint: 'Caesar cipher: shift each letter back 15 positions'
      },
      morse: {
        question: `<div class="font-mono bg-gray-900 text-green-400 p-4 rounded text-2xl text-center">
          <p>.. --. --- .-.</p>
        </div>
        <p class="mt-4">Who is this?</p>`,
        answer: 'Igor',
        hint: 'Morse code: dot = ., dash = -'
      },
      reverse: {
        question: `<div class="font-mono bg-gray-900 text-white p-4 rounded">
          <p class="text-lg">laru eht ni</p>
        </div>
        <p class="mt-4">Where? (one word)</p>`,
        answer: 'ural',
        hint: 'Read it backwards'
      },
      coordinates: {
        question: `<div class="font-mono bg-gray-900 text-green-400 p-4 rounded">
          <p>█1°█3'█5" N</p>
          <p>Missing digits: 6, 1, 0</p>
          <p class="mt-2 text-yellow-400">Sum of all digits = ?</p>
        </div>`,
        answer: '15',
        hint: '6+1+0+3+5 = ?'
      },
      anatomy: {
        question: `<div class="p-4">
          <p class="mb-2">Medical Code:</p>
          <p class="font-mono text-2xl">H-Y-P-O-T-H-E-R-M-I-A</p>
          <p class="mt-4">How many letters?</p>
        </div>`,
        answer: '11',
        hint: 'Count the letters in HYPOTHERMIA'
      },
      pattern: {
        question: `<div class="font-mono text-xl">
          <p>1, 9, 5, 9, ?, ?</p>
          <p class="mt-4">Next number is?</p>
        </div>`,
        answer: '1',
        hint: 'Pattern: 1-9-5-9 repeats'
      },
      math: {
        question: `<div class="font-mono text-xl">
          <p>(10 - 1) × 10 × 10 + 9 = ?</p>
        </div>`,
        answer: '909',
        hint: '9 × 100 + 9'
      },
      riddle: {
        question: `<div class="p-4">
          <p class="italic">"Nine went up, none came down.</p>
          <p>How many met the frozen ground?"</p>
        </div>`,
        answer: '9',
        hint: 'How many died in the incident?'
      },
      binary: {
        question: `<div class="font-mono bg-gray-900 text-green-400 p-4">
          <p>01001001 01100111 01101111 01110010</p>
          <p class="mt-4 text-sm">Binary → ASCII</p>
        </div>`,
        answer: 'Igor',
        hint: 'Convert binary to text'
      },
      anagram: {
        question: `<div class="font-mono text-2xl">
          <p>VARY DOLT</p>
          <p class="mt-4 text-base">Unscramble → Last name</p>
        </div>`,
        answer: 'Dyatlov',
        hint: 'Mix the letters of VARY DOLT'
      },
      substitution: {
        question: `<div class="font-mono bg-gray-900 text-green-400 p-4">
          <p>Code: A=1, B=2, C=3...</p>
          <p class="text-xl mt-2">14-9-14-5</p>
        </div>`,
        answer: 'nine',
        hint: 'N=14, I=9, N=14, E=5'
      },
      decode: {
        question: `<div class="font-mono bg-gray-900 text-green-400 p-4">
          <p>ROT13: HYENY</p>
          <p class="mt-4">Decode this</p>
        </div>`,
        answer: 'ural',
        hint: 'ROT13: rotate letters by 13'
      },
      date: {
        question: `<div class="font-mono">
          <p>Day: 1st + 31st - 1</p>
          <p>Month: February</p>
          <p>Year: 1959</p>
          <p class="mt-4">What date did they perish?</p>
          <p class="text-sm">(Format: DD)</p>
        </div>`,
        answer: '01',
        hint: '1 + 31 - 1 = 31... but in February?'
      },
      headline: {
        question: `<div class="font-mono">
          <p class="text-lg">Read the FIRST letter of each word:</p>
          <p class="mt-2">Never Investigate Nevermore Events</p>
        </div>`,
        answer: 'nine',
        hint: 'N-I-N-E'
      }
    }

    const puzzle = puzzles[puzzleType] || puzzles.cipher
    
    // Generate unique ID and store
    const challengeId = `${itemId}-${currentLayer}-${Date.now()}`
    challengeStore.set(challengeId, {
      ...puzzle,
      itemId,
      layer: currentLayer
    })
    
    console.log('[Generate] Created challenge:', challengeId)
    console.log('[Generate] Puzzle type:', puzzleType)
    console.log('[Generate] Answer:', puzzle.answer)
    console.log('[Generate] Store size:', challengeStore.size)
    
    return Response.json({
      id: challengeId,
      question: puzzle.question,
      hint: puzzle.hint,
      layer: currentLayer
    })
    
  } catch (error) {
    console.error('[Challenge Generation Error]:', error)
    
    // Fallback challenges based on layer
    const fallbacks = [
      {
        question: `<p class="text-lg">In what year did the Dyatlov Pass incident occur?</p><p class="text-sm mt-2 text-gray-400">Hint: Late 1950s, during the Cold War</p>`,
        answer: '1959',
        hint: 'Think about the late Soviet era, just before the 1960s'
      },
      {
        question: `<p class="text-lg">What was the first name of the expedition leader?</p><p class="text-sm mt-2 text-gray-400">Hint: A common Russian name starting with 'I'</p>`,
        answer: 'Igor',
        hint: 'Igor _______'
      },
      {
        question: `<p class="text-lg">How many hikers died in the Dyatlov Pass incident?</p><p class="text-sm mt-2 text-gray-400">Hint: A single digit number</p>`,
        answer: '9',
        hint: 'All members of the expedition perished'
      },
      {
        question: `<p class="text-lg">In which mountain range did the tragedy occur?</p><p class="text-sm mt-2 text-gray-400">Hint: Separates Europe from Asia</p>`,
        answer: 'Ural',
        hint: 'The _____ Mountains'
      }
    ]
    
    const fallback = fallbacks[Math.min(Math.floor(Math.random() * fallbacks.length), fallbacks.length - 1)]
    
    const fallbackId = `fallback-${Date.now()}`
    
    // Store fallback challenge too
    challengeStore.set(fallbackId, {
      ...fallback,
      layer: 1
    })
    
    console.log('[Generate] Created fallback challenge:', fallbackId)
    console.log('[Generate] Fallback answer:', fallback.answer)
    
    return Response.json({
      id: fallbackId,
      ...fallback,
      layer: 1
    })
  }
}