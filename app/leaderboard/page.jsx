'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Clock, Target, Users, User, Medal, Award, Timer, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  const eventEndDate = new Date('2025-11-14T23:59:59')

  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const participantType = localStorage.getItem('participantType')
      const participantId = localStorage.getItem('participantId')
      const teamId = localStorage.getItem('teamId')

      setCurrentUser({
        type: participantType,
        id: participantType === 'team' ? teamId : participantId
      })

      console.log('[Leaderboard] Fetching data from Supabase...')

      const { data: individuals, error: indError } = await supabase
        .from('participants')
        .select(`
          id,
          name,
          class,
          section,
          created_at,
          site_discoveries (
            id,
            discovered_at
          )
        `)

      console.log('[Leaderboard] Participants query result:', { individuals, indError })

      if (indError) throw indError

      const { data: teams, error: teamError } = await supabase
        .from('teams')
        .select(`
          id,
          team_name,
          team_leader_name,
          created_at,
          site_discoveries (
            id,
            discovered_at
          ),
          team_members (
            id,
            member_name,
            class,
            section,
            is_leader,
            created_at
          )
        `)

      console.log('[Leaderboard] Teams query result:', { teams, teamError })

      if (teamError) throw teamError

      // Helper function to calculate time spent
      const calculateTimeSpent = (createdAt) => {
        try {
          let dateString = createdAt
          if (typeof createdAt === 'string') {
            // Normalize ISO string to include Z suffix for proper UTC parsing
            if (!dateString.endsWith('Z') && !dateString.includes('+')) {
              dateString = dateString + 'Z'
            }
          }
          
          const created = new Date(dateString)
          const now = new Date()
          
          // If timestamp is invalid, return placeholder
          if (isNaN(created.getTime())) {
            return '0m'
          }
          
          
          const diffMs = now - created
          if (diffMs < 0 || diffMs > 30 * 24 * 60 * 60 * 1000) {
            return '0m'
          }
          
          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          
          if (days > 0) return `${days}d ${hours}h`
          if (hours > 0) return `${hours}h ${minutes}m`
          return `${minutes}m`
        } catch (err) {
          console.error('[Leaderboard] Error calculating time spent:', err)
          return '0m'
        }
      }

      // Helper function to fetch progress data from user_progress table
      const fetchUserProgress = async (participantId, participantType) => {
        try {
          const { data, error } = await supabase
            .from('user_progress')
            .select('page_visited, visited_at, created_at')
            .eq('participant_id', participantId)
            .eq('participant_type', participantType)
            .order('visited_at', { ascending: true })

          if (error) throw error

          if (!data || data.length === 0) {
            return {
              pagesVisited: 0,
              firstVisitTime: null,
              lastVisitTime: null,
              totalTimeMs: 0,
              pages: []
            }
          }

          const firstVisitTime = new Date(data[0].created_at).getTime()
          const lastVisitTime = new Date(data[data.length - 1].visited_at).getTime()
          const totalTimeMs = lastVisitTime - firstVisitTime

          return {
            pagesVisited: data.length,
            firstVisitTime: new Date(data[0].created_at),
            lastVisitTime: new Date(data[data.length - 1].visited_at),
            totalTimeMs,
            pages: data.map(d => d.page_visited)
          }
        } catch (err) {
          console.error('[Leaderboard] Error fetching user progress:', err)
          return {
            pagesVisited: 0,
            firstVisitTime: null,
            lastVisitTime: null,
            totalTimeMs: 0,
            pages: []
          }
        }
      }

      // Helper function to fetch progress count for a participant
      const fetchProgressCount = async (participantId, participantType) => {
        try {
          const response = await fetch(
            `/api/progress/fetch?participantId=${participantId}&participantType=${participantType}`
          )
          if (response.ok) {
            const data = await response.json()
            return data.pagesCompleted || 0
          }
          return 0
        } catch (err) {
          console.error('[Leaderboard] Error fetching progress:', err)
          return 0
        }
      }

      const processedIndividuals = await Promise.all(
        (individuals || []).map(async (ind) => {
          const progressData = await fetchUserProgress(ind.id, 'individual')
          
          return {
            id: ind.id,
            type: 'individual',
            name: ind.name,
            details: `Class ${ind.class}-${ind.section}`,
            sitesDiscovered: progressData.pagesVisited,
            registeredAt: new Date(ind.created_at),
            firstVisitTime: progressData.firstVisitTime,
            lastVisitTime: progressData.lastVisitTime,
            totalTimeMs: progressData.totalTimeMs,
            pagesVisited: progressData.pages,
            discoveryTimes: progressData.pagesVisited > 0 
              ? [progressData.firstVisitTime.getTime(), ...(progressData.pages.length > 1 ? [progressData.lastVisitTime.getTime()] : [])]
              : [],
            timeSpent: calculateTimeSpent(ind.created_at),
            memberCount: 1,
            createdAtRaw: ind.created_at
          }
        })
      )

      const processedTeams = await Promise.all(
        (teams || []).map(async (team) => {
          const progressData = await fetchUserProgress(team.id, 'team')
          
          // Get earliest team member's created_at for ranking (when team was actually formed)
          let earliestMemberCreatedAt = null
          if (team.team_members && team.team_members.length > 0) {
            const memberDates = team.team_members
              .filter(tm => tm.created_at)
              .map(tm => new Date(tm.created_at).getTime())
            
            if (memberDates.length > 0) {
              earliestMemberCreatedAt = new Date(Math.min(...memberDates))
            }
          }
          
          // Use earliest member's created_at or team's created_at as registration time
          const registrationTime = earliestMemberCreatedAt || new Date(team.created_at)
          
          return {
            id: team.id,
            type: 'team',
            name: team.team_name,
            details: `Leader: ${team.team_leader_name}`,
            sitesDiscovered: progressData.pagesVisited,
            registeredAt: registrationTime,
            firstVisitTime: progressData.firstVisitTime,
            lastVisitTime: progressData.lastVisitTime,
            totalTimeMs: progressData.totalTimeMs,
            pagesVisited: progressData.pages,
            discoveryTimes: progressData.pagesVisited > 0 
              ? [progressData.firstVisitTime.getTime(), ...(progressData.pages.length > 1 ? [progressData.lastVisitTime.getTime()] : [])]
              : [],
            timeSpent: calculateTimeSpent(registrationTime.toISOString()),
            memberCount: team.team_members?.length || 0,
            createdAtRaw: registrationTime.toISOString()
          }
        })
      )

      // After fetching sitesDiscovered we can compute when the user/team achieved that count
      const fillAchievedAt = (arr) => arr.map((entry) => {
        const count = entry.sitesDiscovered || 0
        const times = entry.discoveryTimes || []
        if (count > 0 && times.length >= count) {
          // The time when they achieved their current count is the timestamp of the count-th discovery (1-based)
          entry.achievedAt = new Date(times[count - 1])
          entry.achievedAtMs = times[count - 1]
        } else {
          entry.achievedAt = null
          entry.achievedAtMs = Infinity
        }
        return entry
      })

      const combined = [
        ...processedIndividuals,
        ...processedTeams
      ]
      
      console.log('[Leaderboard] Combined data:', { 
        individualsCount: processedIndividuals.length, 
        teamsCount: processedTeams.length, 
        totalCount: combined.length 
      })
      
      // Prepare data for ranking - using user_progress data
      const participantsForRanking = combined.map(p => ({
        name: p.name,
        type: p.type,
        sitesDiscovered: p.sitesDiscovered,
        firstDiscoveryTime: p.firstVisitTime,
        latestDiscoveryTime: p.lastVisitTime,
        registeredAt: p.registeredAt,
        totalTimeMs: p.totalTimeMs,
        timeSpent: p.timeSpent,
        id: p.id,
        details: p.details,
        memberCount: p.memberCount,
        createdAtRaw: p.createdAtRaw
      }))

      console.log('[Leaderboard] Participants for ranking:', participantsForRanking.length, participantsForRanking)

      try {
        // Call ranking API for intelligent ranking
        const rankingResponse = await fetch('/api/leaderboard/rank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participants: participantsForRanking })
        })

        console.log('[Leaderboard] Ranking API response status:', rankingResponse.status, rankingResponse.statusText)

        if (!rankingResponse.ok) {
          const errorText = await rankingResponse.text()
          console.error('[Leaderboard] Ranking API error response:', errorText)
          throw new Error(`Failed to get rankings: ${rankingResponse.statusText}`)
        }

        const rankingData = await rankingResponse.json()
        
        console.log('[Leaderboard] Ranking API response:', rankingData)
        
        // Map rankings back to full participant objects
        const rankedParticipants = rankingData.rankings
          .map(ranking => {
            const original = combined.find(p => p.name === ranking.name && p.type === ranking.type)
            if (!original) {
              console.warn('[Leaderboard] Could not find original participant for ranking:', ranking)
              return null
            }
            return {
              ...original,
              aiRank: ranking.rank,
              rankReason: ranking.reason
            }
          })
          .filter(Boolean) // Remove nulls

        // Sort by AI rank
        rankedParticipants.sort((a, b) => (a.aiRank || 999) - (b.aiRank || 999))

        console.log('[Leaderboard] AI-ranked data:', rankedParticipants)
        setLeaderboardData(rankedParticipants)
        setLoading(false)
      } catch (err) {
        console.error('[Leaderboard] Error getting AI rankings, falling back to default sort:', err)
        // Fallback: sort by sites discovered desc, then first discovery time asc
        combined.sort((a, b) => {
          if ((b.sitesDiscovered || 0) !== (a.sitesDiscovered || 0)) {
            return (b.sitesDiscovered || 0) - (a.sitesDiscovered || 0)
          }
          const aTime = a.discoveryTimes?.[0] ?? Infinity
          const bTime = b.discoveryTimes?.[0] ?? Infinity
          return aTime - bTime
        })
        setLeaderboardData(combined)
        setLoading(false)
      }

    } catch (err) {
      console.error('[Leaderboard] Error fetching leaderboard:', err?.message || err)
      console.error('[Leaderboard] Full error:', JSON.stringify(err, null, 2))
      setLeaderboardData([])
      setLoading(false)
    }
  }

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = eventEndDate - now

      if (diff <= 0) {
        setCountdown('Event Ended')
        return
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + Math.floor(diff / (1000 * 60 * 60 * 24)) * 24
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  // Refresh leaderboard when window regains focus
  useEffect(() => {
    window.addEventListener('focus', fetchLeaderboard)
    return () => window.removeEventListener('focus', fetchLeaderboard)
  }, [])

  const formatTimeSince = (dateInput) => {
    if (!dateInput) return '0m'
    
    let dateString
    
    if (typeof dateInput === 'string') {
      // Normalize ISO string to include Z suffix for proper UTC parsing
      dateString = dateInput
      if (!dateString.endsWith('Z') && !dateString.includes('+')) {
        dateString = dateString + 'Z'
      }
    } else if (dateInput instanceof Date) {
      dateString = dateInput.toISOString()
    } else {
      return '0m'
    }
    
    const timestamp = new Date(dateString).getTime()
    
    if (isNaN(timestamp)) {
      return '0m'
    }
    
    const now = new Date().getTime()
    const diff = now - timestamp
    
    // If diff is negative or very large (more than 30 days), something is wrong
    if (diff < 0 || diff > 30 * 24 * 60 * 60 * 1000) {
      return '0m'
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-300'
    if (rank === 3) return 'text-orange-400'
    return 'text-neutral-400'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />
    return <span className="text-sm font-mono">{rank}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1b]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Investigation</div>
                <div className="text-sm font-bold">Leaderboard</div>
              </div>
            </div>
            <button
              onClick={() => router.push('/start')}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              ← Back to Investigation
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Event Countdown Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-linear-to-r from-red-950/30 to-orange-950/30 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Timer className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-sm text-neutral-400">Investigation Deadline</div>
                <div className="text-2xl font-bold font-mono text-white">{countdown}</div>
                <div className="text-xs text-neutral-500">Until November 14, 2025</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-400">Total Investigators</div>
              <div className="text-3xl font-bold text-white">{leaderboardData.length}</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <div className="text-sm text-neutral-400">Total Sites</div>
            </div>
            <div className="text-3xl font-bold text-white">😉</div>
            <div className="text-xs text-neutral-500 mt-1">Evidence sites to discover</div>
          </div>

          <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div className="text-sm text-neutral-400">Leading Team</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {leaderboardData[0]?.sitesDiscovered || 0}
            </div>
            <div className="text-xs text-neutral-500 mt-1">Sites discovered</div>
          </div>

          <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div className="text-sm text-neutral-400">Fastest Discovery</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {leaderboardData.length > 0 ? leaderboardData[0].timeSpent : '-'}
            </div>
            <div className="text-xs text-neutral-500 mt-1">Time to first site</div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden">
          
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-linear-to-r from-blue-950/20 to-transparent">
            <h2 className="text-xl font-bold">Rankings</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Ranked by sites discovered • Updated in real-time
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Investigator
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Sites Found
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, index) => {
                  const rank = entry.aiRank || (index + 1)
                  const isCurrentUser = currentUser && 
                    ((currentUser.type === 'team' && entry.type === 'team' && entry.id === currentUser.id) ||
                     (currentUser.type === 'individual' && entry.type === 'individual' && entry.id === currentUser.id))
                  
                  return (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        isCurrentUser ? 'bg-blue-500/10 border-blue-500/30' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className={`flex items-center gap-2 font-bold ${getRankColor(rank)}`}>
                          {getRankIcon(rank)}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            entry.type === 'team' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                          }`}>
                            {entry.type === 'team' ? (
                              <Users className="w-5 h-5 text-blue-400" />
                            ) : (
                              <User className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">
                              {entry.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 truncate">{entry.details}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          entry.type === 'team' 
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                            : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                        }`}>
                          {entry.type === 'team' ? (
                            <>
                              <Users className="w-3 h-3 shrink-0" />
                              <span className="hidden sm:inline">Team</span>
                              <span className="hidden sm:inline">({entry.memberCount})</span>
                              <span className="sm:hidden">T({entry.memberCount})</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 shrink-0" />
                              <span className="hidden sm:inline">Solo</span>
                              <span className="sm:hidden">S</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Sites Found */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white">
                          {entry.sitesDiscovered}
                        </div>
                      </td>

                      {/* Time Spent */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                          <div className="text-xs sm:text-sm font-medium text-white">
                            {entry.timeSpent}
                          </div>
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="w-20 sm:w-24 mx-auto">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                              style={{ width: `${(entry.sitesDiscovered / 20) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-center text-neutral-500 mt-1">
                            {Math.round((entry.sitesDiscovered / 20) * 100)}%
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {leaderboardData.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No investigators yet. Be the first!</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-blue-950/20 border border-blue-500/30 rounded-lg text-center">
          <p className="text-sm text-blue-300">
            🏆 Leaderboard updates every 30 seconds • Rankings based on sites discovered and time efficiency
          </p>
        </div>

      </div>
    </div>
  )
}
