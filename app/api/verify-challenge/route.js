import { challengeStore } from '../challenge-store.js'

export async function POST(request) {
  try {
    const { challengeId, answer, itemId } = await request.json()
    
    console.log('[Verify] Challenge ID:', challengeId)
    console.log('[Verify] User Answer:', answer)
    console.log('[Verify] Store has challenge:', challengeStore.has(challengeId))
    
    const challenge = challengeStore.get(challengeId)
    
    if (!challenge) {
      console.log('[Verify] Challenge not found. Store size:', challengeStore.size)
      return Response.json({ correct: false, message: 'Challenge expired or not found' })
    }
    
    console.log('[Verify] Expected Answer:', challenge.answer)
    
    const normalizedAnswer = answer.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    const normalizedCorrect = challenge.answer.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    // Also check partial matches and common variations
    const answerVariations = [
      normalizedAnswer,
      answer.trim().toLowerCase(), // Keep spaces
      answer.trim(), // Keep case
    ]
    
    const correctVariations = [
      normalizedCorrect,
      challenge.answer.toLowerCase(),
      challenge.answer,
      // Number variations
      challenge.answer === '9' ? 'nine' : null,
      challenge.answer === 'nine' ? '9' : null,
      challenge.answer === '1959' ? 'nineteenfiftynine' : null,
      challenge.answer === '15' ? 'fifteen' : null,
      challenge.answer === '11' ? 'eleven' : null,
      challenge.answer === '1' ? 'one' : null,
      challenge.answer === '909' ? 'ninehundrednine' : null,
      // Name variations
      challenge.answer.toLowerCase().includes('dyatlov') ? 'dyatlov' : null,
      challenge.answer.toLowerCase().includes('igor') ? 'igor' : null,
      challenge.answer.toLowerCase().includes('ural') ? 'ural' : null,
      // Date variations
      challenge.answer === '01' ? '1' : null,
      challenge.answer === '1' ? '01' : null,
    ].filter(Boolean)
    
    const isCorrect = answerVariations.some(av => 
      correctVariations.some(cv => 
        av === cv || av.includes(cv) || cv.includes(av)
      )
    )
    
    console.log('[Verify] Normalized answer:', normalizedAnswer)
    console.log('[Verify] Normalized correct:', normalizedCorrect)
    console.log('[Verify] Is correct:', isCorrect)
    
    if (isCorrect) {
      // Clean up challenge
      challengeStore.delete(challengeId)
    }
    
    return Response.json({
      correct: isCorrect,
      message: isCorrect ? 'Access granted' : 'Incorrect answer'
    })
    
  } catch (error) {
    return Response.json({ correct: false, message: 'Verification failed' }, { status: 500 })
  }
}
