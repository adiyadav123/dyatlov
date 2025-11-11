// Shared challenge store between generate and verify endpoints
// In production, use Redis or a database
export const challengeStore = new Map()
