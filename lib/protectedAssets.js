/**
 * Protected Image Loader for The Dyatlov Chronicles
 * Loads images through secure API endpoint that validates authentication
 */

export function getProtectedImageUrl(assetPath) {
  // Construct URL to protected asset API
  const params = new URLSearchParams({
    type: 'image',
    asset: assetPath,
  })
  return `/api/assets?${params.toString()}`
}

export function getProtectedPdfUrl(assetPath) {
  // Construct URL to protected asset API
  const params = new URLSearchParams({
    type: 'pdf',
    asset: assetPath,
  })
  return `/api/assets?${params.toString()}`
}

/**
 * React component for protected images
 * Usage: <ProtectedImage src="newspapers/1.png" alt="..." />
 */
export function ProtectedImage({
  src,
  alt,
  className,
  style,
  onError,
  ...props
}) {
  const protectedUrl = getProtectedImageUrl(`newspapers/${src}`)

  return (
    <img
      src={protectedUrl}
      alt={alt}
      className={className}
      style={{
        ...style,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitDragAndDrop: 'none',
      }}
      onContextMenu={(e) => {
        // Optional: Disable right-click on images
        e.preventDefault()
        return false
      }}
      onError={onError}
      draggable={false}
      crossOrigin="anonymous"
      {...props}
    />
  )
}

/**
 * Utility to validate if user has permission to access archive
 * Used in components to show/hide protected content
 */
export async function checkArchiveAccess(email) {
  try {
    const response = await fetch('/api/auth/check-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    return data.hasArchiveAccess
  } catch (error) {
    console.error('Failed to check archive access:', error)
    return false
  }
}

/**
 * Utility to validate if page has been discovered by user
 */
export async function checkPageDiscovery(email, pageName) {
  try {
    const response = await fetch('/api/auth/check-discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pageName }),
    })
    const data = await response.json()
    return data.discovered
  } catch (error) {
    console.error('Failed to check page discovery:', error)
    return false
  }
}
