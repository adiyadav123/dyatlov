import { supabase } from '@/lib/supabase'

export async function POST(req) {
  try {
    const { participantId, participantType, pageVisited } = await req.json()

    if (!participantId || !participantType || !pageVisited) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Valid progress pages
    const validPages = ['newspaper-1959', 'voices-1959', 'soviet-archive']
    if (!validPages.includes(pageVisited)) {
      return Response.json(
        { error: 'Invalid page' },
        { status: 400 }
      )
    }

    // Check if this page visit already exists (avoid duplicate tracking)
    const { data: existingVisit, error: checkError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('participant_id', participantId)
      .eq('participant_type', participantType)
      .eq('page_visited', pageVisited)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      throw checkError
    }

    // If already visited, don't track again
    if (existingVisit) {
      return Response.json(
        { message: 'Page already tracked', isNew: false },
        { status: 200 }
      )
    }

    // Insert new progress record
    const { data, error } = await supabase
      .from('user_progress')
      .insert([
        {
          participant_id: participantId,
          participant_type: participantType,
          page_visited: pageVisited,
          visited_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    return Response.json(
      { message: 'Progress tracked successfully', isNew: true, data },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Progress Track API] Error:', err)
    return Response.json(
      { error: err.message || 'Failed to track progress' },
      { status: 500 }
    )
  }
}
