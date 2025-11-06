import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import fs from 'fs/promises'
import path from 'path'

/**
 * Protected asset API endpoint
 * Serves images and PDFs only to authenticated users with proper permissions
 * 
 * Usage: GET /api/assets?type=image&asset=newspapers/1.png
 * or: GET /api/assets?type=pdf&asset=investigation_reports/1.pdf
 */

export async function GET(request) {
  try {
    // Get auth token from request
    const authToken = request.cookies.get('auth_token')?.value
    const userEmail = request.cookies.get('user_email')?.value

    // Check authentication
    if (!authToken || !userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized: Not authenticated' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const assetType = searchParams.get('type')
    const assetPath = searchParams.get('asset')

    if (!assetType || !assetPath) {
      return NextResponse.json(
        { error: 'Missing required parameters: type and asset' },
        { status: 400 }
      )
    }

    // Validate asset type
    if (!['image', 'pdf'].includes(assetType)) {
      return NextResponse.json(
        { error: 'Invalid asset type' },
        { status: 400 }
      )
    }

    // Prevent directory traversal attacks
    if (assetPath.includes('..') || assetPath.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid asset path' },
        { status: 403 }
      )
    }

    // Determine asset directory
    let assetDir = ''
    if (assetType === 'image') {
      // Images: newspapers are always accessible for authenticated users
      if (assetPath.startsWith('newspapers/')) {
        assetDir = 'newspapers'
      } else {
        return NextResponse.json(
          { error: 'Invalid image asset' },
          { status: 403 }
        )
      }
    } else if (assetType === 'pdf') {
      // PDFs: Investigation reports require additional authentication
      if (assetPath.startsWith('investigation_reports/')) {
        // Check if user has authenticated for archive access
        const userProgress = await supabase
          .from('user_progress')
          .select('is_archive_authenticated')
          .eq('email', userEmail)
          .single()

        if (!userProgress.data?.is_archive_authenticated) {
          return NextResponse.json(
            { error: 'Unauthorized: Archive access required' },
            { status: 403 }
          )
        }

        assetDir = 'redacted_investigation_reports'
      } else {
        return NextResponse.json(
          { error: 'Invalid PDF asset' },
          { status: 403 }
        )
      }
    }

    // Build full file path
    const fullPath = path.join(
      process.cwd(),
      'public',
      assetDir,
      assetPath.split('/').pop()
    )

    // Verify file exists and is within public directory
    const publicDir = path.join(process.cwd(), 'public')
    const resolvedPath = path.resolve(fullPath)
    if (!resolvedPath.startsWith(publicDir)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Read file
    const fileBuffer = await fs.readFile(fullPath)

    // Determine content type
    let contentType = 'application/octet-stream'
    if (assetType === 'image') {
      if (fullPath.endsWith('.png')) contentType = 'image/png'
      else if (fullPath.endsWith('.jpg')) contentType = 'image/jpeg'
      else if (fullPath.endsWith('.gif')) contentType = 'image/gif'
      else if (fullPath.endsWith('.webp')) contentType = 'image/webp'
    } else if (assetType === 'pdf') {
      contentType = 'application/pdf'
    }

    // Log access (optional - for audit trail)
    try {
      await supabase.from('asset_access_logs').insert({
        user_email: userEmail,
        asset_path: assetPath,
        asset_type: assetType,
        accessed_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.error('Failed to log asset access:', logError)
      // Don't fail the request if logging fails
    }

    // Return file with security headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
    })
  } catch (error) {
    console.error('Asset API Error:', error)

    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
