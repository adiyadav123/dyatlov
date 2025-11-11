import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get all participants
    const { data: participants, error: participantsError } = await supabase
      .from('quizart_participants')
      .select('id')

    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 })
    }

    const results = []

    // Recalculate scores for each participant
    for (const participant of participants) {
      const participantId = participant.id

      // Count correct answers for each difficulty
      const { data: easyCorrect } = await supabase
        .from('quizart_progress')
        .select('id')
        .eq('participant_id', participantId)
        .eq('difficulty', 'easy')
        .eq('is_correct', true)

      const { data: mediumCorrect } = await supabase
        .from('quizart_progress')
        .select('id')
        .eq('participant_id', participantId)
        .eq('difficulty', 'medium')
        .eq('is_correct', true)

      const { data: hardCorrect } = await supabase
        .from('quizart_progress')
        .select('id')
        .eq('participant_id', participantId)
        .eq('difficulty', 'hard')
        .eq('is_correct', true)

      // Calculate points (Easy=2, Medium=3, Hard=5)
      const easyScore = (easyCorrect?.length || 0) * 2
      const mediumScore = (mediumCorrect?.length || 0) * 3
      const hardScore = (hardCorrect?.length || 0) * 5
      const totalScore = easyScore + mediumScore + hardScore

      // Update scores
      const { error: updateError } = await supabase
        .from('quizart_scores')
        .update({
          easy_score: easyScore,
          medium_score: mediumScore,
          hard_score: hardScore,
          total_score: totalScore
        })
        .eq('participant_id', participantId)

      if (updateError) {
        console.error('Error updating scores for participant:', participantId, updateError)
      } else {
        results.push({
          participantId,
          easyCorrect: easyCorrect?.length || 0,
          mediumCorrect: mediumCorrect?.length || 0,
          hardCorrect: hardCorrect?.length || 0,
          easyScore,
          mediumScore,
          hardScore,
          totalScore
        })
      }
    }

    return NextResponse.json({
      message: 'Scores recalculated successfully',
      participantsUpdated: results.length,
      results
    })

  } catch (error) {
    console.error('Error recalculating scores:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
