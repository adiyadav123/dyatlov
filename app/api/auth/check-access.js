import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Check if user has authenticated for archive access
 * POST /api/auth/check-access
 */
export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    // Check if user has authenticated for archive
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('is_archive_authenticated')
      .eq('email', email)
      .single()

    return NextResponse.json({
      hasArchiveAccess: userProgress?.is_archive_authenticated || false,
    })
  } catch (error) {
    console.error('Check access error:', error)
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    )
  }
}
