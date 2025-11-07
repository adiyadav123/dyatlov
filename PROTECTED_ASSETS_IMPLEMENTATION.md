# Protected Assets Implementation Summary

## Overview
All application assets (newspapers, images, PDFs, SVGs, icons) have been moved out of the public directory and are now served through a secure, server-side protected assets API. This prevents direct URL access, crawler discovery, and unauthorized downloads.

## Changes Made

### 1. **File Migration**
- **Source**: `public/` directory
- **Destination**: `protected_files/` directory
- **Assets moved**:
  - `newspapers/` (15 images)
  - `redacted_investigation_reports/` (1 PDF)
  - `interdepartmental_tranfer_report/` (1 PDF)
  - Root-level images: `logo.png`, `cia.png`, `soviet-archive_isapage.png`
  - Root-level icons: `file.svg`, `globe.svg`, `next.svg`, `window.svg`
- **Verification**: `public/` now contains only `robots.txt`

### 2. **Protected Assets API** (`app/api/protected/route.js`)
#### Dual-Mode Serving
- **GET Handler** (`/api/protected?file=...`):
  - Serves public assets (newspapers, images) without authentication
  - Returns proper MIME types and content headers
  - Prevents access to restricted files
- **POST Handler** (`/api/protected`):
  - Serves restricted assets (PDFs, reports) with credential validation
  - Requires `caseId`, `password`, `file`, and `action` in JSON body
  - Returns 401 if credentials invalid

#### Security Headers (All Responses)
```javascript
'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
'Pragma': 'no-cache'
'Expires': '0'
'X-Content-Type-Options': 'nosniff'  // Prevent MIME-type sniffing
'X-Frame-Options': 'DENY'             // Prevent framing
'X-XSS-Protection': '1; mode=block'
'Referrer-Policy': 'no-referrer'
'Content-Disposition': 'inline' or 'attachment' based on action
```

#### Supported Formats
- `.pdf` → `application/pdf`
- `.png` → `image/png`
- `.jpg` / `.jpeg` → `image/jpeg`
- `.gif` → `image/gif`
- `.svg` → `image/svg+xml`
- `.webp` → `image/webp`

#### Path Traversal Protection
- Validates file paths to prevent `..` and absolute paths
- Ensures resolved path stays within `protected_files/`
- Returns 403 for invalid paths

### 3. **Client Updates** (`app/soviet-archive/page.jsx`)
#### Data Structure Changes
- File paths no longer have leading `/` (e.g., `newspapers/1.png` instead of `/newspapers/1.png`)
- All assets now routed through protected API

#### New Handler: `handleAssetAccess(asset, action)`
- Detects asset category (newspapers vs. PDFs)
- **For public assets (newspapers)**:
  - Calls GET `/api/protected?file=...` (no auth)
  - Opens blob in new tab or triggers download
- **For restricted assets (PDFs)**:
  - Shows auth modal; delegates to existing `handleReportAccess` flow (POST with credentials)

#### UI Rendering
- Newspapers: Direct buttons calling `handleAssetAccess`
- PDFs/Reports: Buttons calling `handleReportClick` (existing auth-required flow)

#### Console Safety
- All console calls wrapped in `safeConsole` helper
- Prevents crashes if console.* methods are overridden
- Defensive error handling in fetch flows

### 4. **Crawler & Bot Prevention**
#### `public/robots.txt` (New)
```
User-agent: *
Disallow: /protected_files
Disallow: /api/protected
Allow: /
```
- Instructs search engines and crawlers to not access protected assets or API
- Compliant with robots.txt standard

### 5. **Git Security** (`.gitignore`)
- Added entry: `protected_files/` to .gitignore
- Prevents accidental commits of sensitive files
- History cleanup recommended if files were previously committed

## Security Benefits

1. **No Direct URL Exposure**: Assets are not served by the static file server; they require API calls.
2. **Credential Validation**: Restricted files (PDFs) require correct Case ID and password.
3. **No Cache**: Security headers prevent browser caching of sensitive files.
4. **MIME-Type Protection**: `X-Content-Type-Options: nosniff` prevents browser MIME-sniffing attacks.
5. **Crawler Exclusion**: `robots.txt` and API structure prevent search engine indexing.
6. **Path Traversal Prevention**: Strict path validation blocks directory traversal attempts.
7. **Access Logging**: Server logs all protected asset requests (file name, size, MIME type).

## Usage Examples

### Client: View Newspaper (Unauthenticated)
```javascript
fetch('/api/protected?file=newspapers/1.png')
  .then(r => r.blob())
  .then(blob => window.open(URL.createObjectURL(blob)))
```

### Client: Download Report (Authenticated)
```javascript
fetch('/api/protected', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    caseId: '195902',
    password: 'sverdlovskoblastprosecutoroffice1959',
    file: 'redacted_investigation_reports/1.pdf',
    action: 'download'
  })
})
  .then(r => r.blob())
  .then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'report.pdf';
    a.click();
  })
```

## Testing Checklist

- [ ] Reload Soviet Archive page → newspapers load via API (no 404s)
- [ ] Click View on newspaper → opens in new tab via blob URL
- [ ] Click Download on newspaper → triggers browser download
- [ ] Attempt GET `/api/protected?file=redacted_investigation_reports/1.pdf` → returns 403 (restricted)
- [ ] Click View/Download on restricted PDF → auth modal appears
- [ ] Enter invalid credentials → "Invalid credentials" error
- [ ] Enter correct credentials → PDF opens/downloads
- [ ] Check browser Network tab → `/api/protected` responses have security headers
- [ ] Check dev server logs → see `[Protected Assets] served file=...` messages
- [ ] Try `..` path traversal in API call → returns 403
- [ ] Run `curl -I /api/protected` → returns proper MIME-Type, no caching headers

## Remaining Optional Improvements

1. **Signed URLs**: Generate temporary, expiring URLs signed with a server key (more sophisticated than basic auth).
2. **Unlock Cookie**: Create `/api/archive/unlock` to set an HttpOnly cookie so users don't re-enter credentials per file.
3. **Rate Limiting**: Add rate limiting to `/api/protected` to prevent abuse.
4. **Audit Logging**: Store access attempts in database for security audit.
5. **S3 / Supabase Migration**: Move files to cloud storage with signed URLs instead of filesystem serving.

## Files Modified

1. `app/api/protected/route.js` — Rewrote entirely; added GET handler, dual MIME support, security headers
2. `app/soviet-archive/page.jsx` — Updated file paths (removed `/`), added `handleAssetAccess`, switched to `safeConsole`
3. `public/robots.txt` — Created (new file)
4. `.gitignore` — Added `protected_files/` entry
5. `public/` — Deleted: `newspapers/`, `redacted_investigation_reports/`, `interdepartmental_tranfer_report/`, `*.png`, `*.svg`

## Deployment Notes

- **No environment variables needed** for basic setup (credentials are hardcoded in API, as per existing pattern)
- **File paths case-sensitive** (especially on Linux/Unix deployments)
- **Verify `process.cwd()` works correctly** in your deployment environment; it should return the app root
- **Monitor server logs** for access patterns and potential abuse
