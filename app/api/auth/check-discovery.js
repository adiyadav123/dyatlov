import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Check if user has discovered a specific page
 * POST /api/auth/check-discovery
 */
export async function POST(request) {
  try {
    const { email, pageName } = await request.json()

    if (!email || !pageName) {
      return NextResponse.json(
        { error: 'Email and pageName required' },
        { status: 400 }
      )
    }

    // Check if page is in visited sites
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('visited_sites')
      .eq('email', email)
      .single()

    const visitedSites = userProgress?.visited_sites || []
    const discovered = visitedSites.includes(pageName)

    return NextResponse.json({ discovered })
  } catch (error) {
    console.error('Check discovery error:', error)
    return NextResponse.json(
      { error: 'Failed to check discovery' },
      { status: 500 }
    )
  }
}
