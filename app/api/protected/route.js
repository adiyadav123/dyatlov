import fs from 'fs/promises'
import path from 'path'

// Protected assets serving endpoint.
// GET /api/protected?file=... — serves public assets (newspapers, images, icons) without auth.
// POST /api/protected — serves restricted assets (PDFs, reports) with auth (caseId, password).
// All responses include security headers to prevent caching and content-type sniffing.

const ARCHIVE_CASE_ID = '195902'
const ARCHIVE_PASSWORD = 'sverdlovskoblastprosecutoroffice1959'

// Files that require authentication (PDFs, restricted documents)
const RESTRICTED_FILES = [
  'redacted_investigation_reports',
  'interdepartmental_tranfer_report'
]

// Determine if a file path is restricted
function isRestricted(filePath) {
  return RESTRICTED_FILES.some(prefix => filePath.startsWith(prefix))
}

// Safely determine MIME type
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const mimeMap = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  }
  return mimeMap[ext] || 'application/octet-stream'
}

// Core file serving logic (shared by GET and POST)
async function serveFile(filePath, action = 'view') {
  try {
    // Prevent directory traversal attacks
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return new Response(JSON.stringify({ error: 'Invalid file path' }), { status: 403 })
    }

    // Build safe path
    const protectedRoot = path.join(process.cwd(), 'protected_files')
    const fullPath = path.join(protectedRoot, filePath)
    const resolved = path.resolve(fullPath)

    // Ensure resolved path is within protectedRoot
    if (!resolved.startsWith(path.resolve(protectedRoot))) {
      console.warn(`Protected API: attempted directory traversal: ${filePath}`)
      return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 })
    }

    // Read file
    const data = await fs.readFile(resolved)
    const size = data?.byteLength ?? Buffer.byteLength(data)
    const mime = getMimeType(resolved)

    console.log(`[Protected Assets] served file=${filePath} size=${size} mime=${mime}`)

    // Security headers
    const headers = new Headers({
      'Content-Type': mime,
      'Content-Length': String(size),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer'
    })

    // Set Content-Disposition based on action
    if (action === 'download') {
      const fileName = path.basename(resolved)
      headers.set('Content-Disposition', `attachment; filename="${fileName}"`)
    } else {
      headers.set('Content-Disposition', 'inline')
    }

    return new Response(data, { status: 200, headers })
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`[Protected Assets] File not found: ${filePath}`)
      return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 })
    }
    console.error('[Protected Assets] Error serving file:', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

// GET handler: serve public assets (newspapers, images) without auth
export async function GET(req) {
  try {
    const url = new URL(req.url)
    const filePath = url.searchParams.get('file')

    if (!filePath) {
      return new Response(JSON.stringify({ error: 'Missing file parameter' }), { status: 400 })
    }

    // Check if restricted
    if (isRestricted(filePath)) {
      console.warn(`[Protected Assets] Attempted to access restricted file via GET: ${filePath}`)
      return new Response(JSON.stringify({ error: 'This file requires authentication' }), { status: 403 })
    }

    return await serveFile(filePath, 'view')
  } catch (err) {
    console.error('[Protected Assets] GET error:', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

// POST handler: serve restricted assets with auth
export async function POST(req) {
  try {
    const { caseId, password, file, action } = await req.json()

    if (!caseId || !password || !file) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
    }

    // Validate credentials
    if (caseId.trim().toUpperCase() !== ARCHIVE_CASE_ID.toUpperCase() ||
        password.trim().toLowerCase() !== ARCHIVE_PASSWORD.toLowerCase()) {
      console.warn(`[Protected Assets] Failed auth attempt for file: ${file}`)
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
    }

    // If not restricted, allow via GET instead (security best practice)
    if (!isRestricted(file)) {
      console.log(`[Protected Assets] Non-restricted file accessed via POST with auth: ${file}`)
    }

    return await serveFile(file, action || 'view')
  } catch (err) {
    console.error('[Protected Assets] POST error:', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
