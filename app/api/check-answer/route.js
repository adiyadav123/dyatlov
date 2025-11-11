import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request) {
  let userAnswer, correctAnswer, riddle
  
  try {
    const body = await request.json()
    userAnswer = body.userAnswer
    correctAnswer = body.correctAnswer
    riddle = body.riddle

    if (!userAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If exact match (case-insensitive), return correct immediately
    if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      return NextResponse.json({ isCorrect: true, reason: 'Exact match' })
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured')
      return NextResponse.json({
        isCorrect: false,
        reason: 'API key not configured'
      })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `You are an answer validator. Check if the user's answer is correct.

Riddle: ${riddle || 'N/A'}
Correct Answer: ${correctAnswer}
User Answer: ${userAnswer}

Accept spelling mistakes, typos, and alternative phrasings.

Respond ONLY with valid JSON:
{
  "isCorrect": true,
  "reason": "explanation"
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log('Gemini response:', text)

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({
        isCorrect: false,
        reason: 'Could not parse AI response'
      })
    }

    const aiResponse = JSON.parse(jsonMatch[0])
    return NextResponse.json(aiResponse)

  } catch (error) {
    console.error('Gemini API Error:', error.message)
    
    // Always return valid response, never 500
    if (userAnswer && correctAnswer) {
      return NextResponse.json({
        isCorrect: userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase(),
        reason: 'AI unavailable, using exact match'
      })
    }
    
    return NextResponse.json({
      isCorrect: false,
      reason: 'Error: ' + error.message
    })
  }
}
