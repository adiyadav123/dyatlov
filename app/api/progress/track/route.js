import { supabase } from '@/lib/supabase'

export async function POST(req) {
  try {
    const body = await req.json()
    console.log('[Progress Track API] Request body:', body)
    
    const { participantId, participantType, pageVisited } = body

    if (!participantId || !participantType || !pageVisited) {
      console.error('[Progress Track API] Missing fields:', { participantId, participantType, pageVisited })
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Valid progress pages
    const validPages = ['newspaper-1959', 'voices-1959', 'soviet-archive', 'evidence']
    if (!validPages.includes(pageVisited)) {
      return Response.json(
        { error: 'Invalid page' },
        { status: 400 }
      )
    }

    console.log('[Progress Track API] Checking for existing visit:', { participantId, participantType, pageVisited })

    // Check if this page visit already exists (avoid duplicate tracking)
    const { data: existingVisit, error: checkError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('participant_id', participantId)
      .eq('participant_type', participantType)
      .eq('page_visited', pageVisited)

    // Handle both cases: error and no rows found
    if (checkError) {
      console.error('[Progress Track API] Check error:', checkError)
      // Still try to insert, don't throw
    } else {
      console.log('[Progress Track API] Check success, existingVisit:', existingVisit)
    }

    // If already visited, don't track again (check if we got data)
    if (existingVisit && existingVisit.length > 0) {
      console.log('[Progress Track API] Page already tracked')
      return Response.json(
        { message: 'Page already tracked', isNew: false },
        { status: 200 }
      )
    }

    console.log('[Progress Track API] Inserting new progress record')

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

    if (error) {
      console.error('[Progress Track API] Insert error:', error)
      throw error
    }

    console.log('[Progress Track API] Insert success:', data)

    return Response.json(
      { message: 'Progress tracked successfully', isNew: true, data },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Progress Track API] Catch error:', err)
    console.error('[Progress Track API] Error details:', {
      message: err.message,
      code: err.code,
      status: err.status,
      body: err.body
    })
    return Response.json(
      { error: err.message || 'Failed to track progress' },
      { status: 500 }
    )
  }
}
