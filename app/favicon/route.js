import fs from 'fs/promises'
import path from 'path'

// Serve favicon without authentication
// This is a public asset served directly, but from protected_files for consistency
export async function GET(req) {
  try {
    const protectedRoot = path.join(process.cwd(), 'protected_files')
    const faviconPath = path.join(protectedRoot, 'logo.png')
    const resolved = path.resolve(faviconPath)

    // Ensure path is within protectedRoot
    if (!resolved.startsWith(path.resolve(protectedRoot))) {
      return new Response('Not found', { status: 404 })
    }

    const data = await fs.readFile(resolved)

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(data.byteLength),
        'Cache-Control': 'public, max-age=86400', // Cache favicon for 24 hours
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch (err) {
    if (err.code === 'ENOENT') {
      return new Response('Not found', { status: 404 })
    }
    console.error('[Favicon] Error serving favicon:', err)
    return new Response('Server error', { status: 500 })
  }
}
