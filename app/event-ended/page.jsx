'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function EventEndedPage() {
  const router = useRouter()
  const [winners, setWinners] = useState([])
  const [quizartWinners, setQuizartWinners] = useState([])
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)

  // Event end date (same as leaderboard)
  const eventEndDate = new Date('2025-11-30T23:59:59')

  useEffect(() => {
    // Fetch winners and credits
    fetchWinners()
    fetchQuizartWinners()
    fetchCredits()
  }, [])

  const fetchQuizartWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('quizart_scores')
        .select(`*, participant:quizart_participants(name, class, section)`)
        .order('total_score', { ascending: false })
        .limit(3)

      if (error) throw error

      if (data && data.length > 0) {
        const mapped = data.map(d => ({
          name: d.participant?.name || d.participant_name || 'Unknown',
          class: d.participant?.class || null,
          section: d.participant?.section || null,
          total: d.total_score || 0
        }))
        setQuizartWinners(mapped)
        return
      }
    } catch (err) {
      console.error('[EventEnded] Failed to fetch QuizArt winners:', err)
    }

    // Fallback static winners (from provided attachment)
    setQuizartWinners([
      { name: 'Dhairya 3A', class: '3', section: 'A', total: 60 },
      { name: 'Sneha', class: '5', section: 'E', total: 60 },
      { name: 'Bhavika Tripathi', class: '5', section: 'E', total: 60 }
    ])
  }

  const fetchCredits = async () => {
    try {
      // Hardcode the credits to match landing page (copied from app/page.jsx content)
      const creditsObj = {
        orgName: 'JCC Varanasi',
        manager: 'Aditya Yadav',
        creativeHead: 'Shubhankar M. Panth',
        voices: ['Manish Sir', 'Shikha Ma\'am', 'Smriti Ma\'am', 'Tirthankar Sir'],
        graphics: ['Aditi Seth', 'Aaditri Singh', 'Swastik Gupta', 'Vanshika Singh', 'Hunar Subedi']
      }
      setCredits(creditsObj)
    } catch (err) {
      console.error('[EventEnded] Failed to set credits:', err)
    }
  }

  const fetchWinners = async () => {
    setLoading(true)
    try {
      // Fetch participants & teams using supabase (same as leaderboard)
      const { data: individuals, error: indError } = await supabase
        .from('participants')
        .select(`
          id,
          name,
          class,
          section,
          created_at
        `)

      if (indError) throw indError

      const { data: teams, error: teamError } = await supabase
        .from('teams')
        .select(`
          id,
          team_name,
          team_leader_name,
          created_at,
          team_members (
            id,
            member_name,
            class,
            section,
            created_at
          )
        `)

      if (teamError) throw teamError

      // Helper: fetch progress entries from user_progress table (same as leaderboard)
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
          console.error('[EventEnded] Error fetching user progress:', err)
          return {
            pagesVisited: 0,
            firstVisitTime: null,
            lastVisitTime: null,
            totalTimeMs: 0,
            pages: []
          }
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
            pagesVisitedArr: progressData.pages
          }
        })
      )

      const processedTeams = await Promise.all(
        (teams || []).map(async (team) => {
          const progressData = await fetchUserProgress(team.id, 'team')

          // Determine registration time: earliest team member created_at or team.created_at
          let earliestMemberCreatedAt = null
          if (team.team_members && team.team_members.length > 0) {
            const memberDates = team.team_members
              .filter(tm => tm.created_at)
              .map(tm => new Date(tm.created_at).getTime())
            if (memberDates.length > 0) {
              earliestMemberCreatedAt = new Date(Math.min(...memberDates))
            }
          }

          const registrationTime = earliestMemberCreatedAt || new Date(team.created_at)

          return {
            id: team.id,
            type: 'team',
            name: team.team_name,
            members: team.team_members || [],
            details: `Leader: ${team.team_leader_name}`,
            sitesDiscovered: progressData.pagesVisited,
            registeredAt: registrationTime,
            firstVisitTime: progressData.firstVisitTime,
            lastVisitTime: progressData.lastVisitTime,
            totalTimeMs: progressData.totalTimeMs,
            pagesVisitedArr: progressData.pages
          }
        })
      )

      const combined = [...processedIndividuals, ...processedTeams]

      // Prepare participants for ranking API with discovery timestamps
      const participantsForRanking = combined.map(p => ({
        name: p.name,
        type: p.type,
        sitesDiscovered: p.sitesDiscovered,
        firstDiscoveryTime: p.firstVisitTime,
        latestDiscoveryTime: p.lastVisitTime,
        registeredAt: p.registeredAt,
        totalTimeMs: p.totalTimeMs
      }))

      const rankingResp = await fetch('/api/leaderboard/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: participantsForRanking })
      })

      if (rankingResp.ok) {
        const rankingData = await rankingResp.json()
        const top3 = rankingData.rankings.slice(0, 3)

        const winnersMapped = top3.map(rankEntry => {
          const original = combined.find(p => p.name === rankEntry.name && p.type === rankEntry.type)
          return { ...rankEntry, ...original }
        })
        setWinners(winnersMapped)
      } else {
        // Fallback: sort by sites discovered and registration time
        combined.sort((a, b) => {
          if ((b.sitesDiscovered || 0) !== (a.sitesDiscovered || 0)) return (b.sitesDiscovered || 0) - (a.sitesDiscovered || 0)
          const aTime = a.firstVisitTime ? a.firstVisitTime.getTime() : Infinity
          const bTime = b.firstVisitTime ? b.firstVisitTime.getTime() : Infinity
          return aTime - bTime
        })
        setWinners(combined.slice(0, 3))
      }

    } catch (err) {
      console.error('[EventEnded] Error fetching winners:', err)
    } finally {
      setLoading(false)
    }
  }

  const backToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white p-10">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-cormorant-sc font-700 bg-clip-text bg-gradient-to-br from-amber-200 via-orange-300 to-amber-500 text-transparent">EVENT ENDED</h1>
          <p className="text-stone-400 mt-2">Thank you for participating. The investigation has concluded.</p>
          <div className="mt-4 text-sm text-stone-400">Event ended on {eventEndDate.toUTCString()}</div>
        </div>

        {/* QuizArt Winners Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">🏅 QuizArt Winners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quizartWinners.length === 0 ? (
              <div className="col-span-3 text-center text-stone-400">No QuizArt winners to display</div>
            ) : (
              quizartWinners.map((q, idx) => (
                <div key={idx} className="bg-[#0f1720] border border-white/10 rounded-lg p-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : 'bg-orange-400'}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{q.name}</div>
                      <div className="text-xs text-neutral-400">{q.class ? `Class ${q.class}` : ''} {q.section ? `- ${q.section}` : ''}</div>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-300">Score: <span className="font-bold text-white">{q.total}/60</span></div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='mt-10'>
          <h2 className="text-2xl font-bold mb-4">🏅 Dyatlov Chronicles Winners</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {loading ? (
            <div className="col-span-3 text-center">Loading winners...</div>
          ) : (
            winners.map((winner, i) => (
              <div key={i} className="bg-[#1a1a1b] border border-white/10 rounded-lg p-6 text-left">
                <div className="flex items-start justify-start gap-3 mb-4">
                  <Trophy className={`w-10 h-10 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400'}`} />
                  <div className="text-left w-full">
                    <div className="text-xl font-bold">{winner.name}</div>
                    <div className="text-xs text-neutral-400 mt-1">{winner.type === 'team' ? winner.details : (winner.details || '')}</div>
                  </div>
                </div>
                <div className="text-sm text-neutral-400 mb-2">Sites Discovered: {winner.sitesDiscovered}</div>
                {winner.type === 'team' && (
                  <div className="text-sm text-neutral-300">
                    <div className="mb-1 font-semibold text-amber-400">Team Members:</div>
                    <ul className="list-disc list-inside">
                      {winner.members && winner.members.map((m) => (
                        <li key={m.id} className="text-sm text-stone-200">{m.member_name} {m.class ? `(${m.class})` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-16 bg-[#1a1a1b] border border-white/10 rounded-lg p-6 text-left">
          <div className="text-sm text-stone-400">Organized by</div>
          <div className="text-white text-lg font-bold">{credits?.orgName}</div>
          <div className="text-sm text-stone-400 mt-2">Event Manager: {credits?.manager}</div>
          <div className="text-sm text-stone-400 mt-2">Creative Head: {credits?.creativeHead}</div>
          <div className="mt-2 text-sm text-amber-400 font-semibold">Voices & Dialogues</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {credits?.voices && credits.voices.map((v, idx) => (
              <div key={idx} className="px-3 py-1 bg-stone-900/30 border border-stone-800/50 rounded-full text-sm text-stone-200">{v}</div>
            ))}
          </div>

          <div className="mt-4 text-sm text-amber-400 font-semibold">Graphics & Story</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {credits?.graphics && credits.graphics.map((g, idx) => (
              <div key={idx} className="px-3 py-1 bg-stone-900/30 border border-stone-800/50 rounded-full text-sm text-stone-200">{g}</div>
            ))}
          </div>

          
        </div>
      </div>
    </div>
  )
}
