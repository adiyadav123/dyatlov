import { supabase } from '@/lib/supabase'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const participantId = searchParams.get('participantId')
    const participantType = searchParams.get('participantType')

    if (!participantId || !participantType) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Fetch all progress entries for this participant
    const { data, error } = await supabase
      .from('user_progress')
      .select('page_visited, visited_at')
      .eq('participant_id', participantId)
      .eq('participant_type', participantType)
      .order('visited_at', { ascending: true })

    if (error) throw error

    // Count pages visited
    const progressPages = ['newspaper-1959', 'voices-1959', 'soviet-archive']
    const visitedPages = data?.map(p => p.page_visited) || []
    const pagesCompleted = visitedPages.filter(page =>
      progressPages.includes(page)
    ).length

    return Response.json(
      {
        totalProgressPages: progressPages.length,
        pagesCompleted,
        visitedPages,
        progressData: data,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Progress Fetch API] Error:', err)
    return Response.json(
      { error: err.message || 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
