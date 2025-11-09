'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Skull, Activity, MapPin, Calendar, ArrowLeft, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MedicalRecordsPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const participantType = localStorage.getItem('participantType')
        const participantId = localStorage.getItem('participantId')
        const teamId = localStorage.getItem('teamId')
        
        if (!participantType || !participantId && !teamId) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        // Check if user has accessed the checkpoint to unlock this page
        const id = participantType === 'team' ? teamId : participantId
        const response = await fetch(
          `/api/progress/fetch?participantId=${id}&participantType=${participantType}`
        )
        
        if (response.ok) {
          const data = await response.json()
          // Medical records are accessible after visiting soviet-archive (checkpoint)
          setIsAuthorized(data.pagesCompleted > 0)
        } else {
          setIsAuthorized(false)
        }
      } catch (err) {
        console.error('Authorization check failed:', err)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [])

  const autopsyReports = [
    {
      id: 1,
      name: 'Igor Dyatlov',
      title: 'Autopsy Report #1',
      date: '04.03.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-001',
      causeOfDeath: 'Hypothermia',
      injuries: 'Minor abrasions, frostbite on extremities',
      pages: 12,
      status: 'Complete',
      foundDate: '26.02.1959',
      location: '1500m from tent, near cedar tree'
    },
    {
      id: 2,
      name: 'Zinaida Kolmogorova',
      title: 'Autopsy Report #2',
      date: '04.03.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-002',
      causeOfDeath: 'Hypothermia',
      injuries: 'Bruising on lower back, tissue damage on hands',
      pages: 11,
      status: 'Complete',
      foundDate: '27.02.1959',
      location: '630m from tent, on slope returning to camp'
    },
    {
      id: 3,
      name: 'Rustem Slobodin',
      title: 'Autopsy Report #3',
      date: '05.03.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-003',
      causeOfDeath: 'Hypothermia',
      injuries: 'Skull fracture, multiple contusions',
      pages: 13,
      status: 'Complete',
      foundDate: '27.02.1959',
      location: '480m from tent, between Kolmogorova and Dyatlov'
    },
    {
      id: 4,
      name: 'Yuri Krivonischenko',
      title: 'Autopsy Report #4',
      date: '06.03.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-004',
      causeOfDeath: 'Hypothermia',
      injuries: 'Burns on hands and legs, tissue missing from lips',
      pages: 14,
      status: 'Complete',
      foundDate: '27.02.1959',
      location: 'At cedar tree, 1500m from tent'
    },
    {
      id: 5,
      name: 'Yuri Doroshenko',
      title: 'Autopsy Report #5',
      date: '06.03.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-005',
      causeOfDeath: 'Hypothermia',
      injuries: 'Burns on legs, grey foam around mouth',
      pages: 12,
      status: 'Complete',
      foundDate: '27.02.1959',
      location: 'At cedar tree, next to Krivonischenko'
    },
    {
      id: 6,
      name: 'Lyudmila Dubinina',
      title: 'Autopsy Report #6',
      date: '09.05.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-006',
      causeOfDeath: 'Massive chest trauma',
      injuries: 'Broken ribs, internal hemorrhaging, missing tongue and eyes',
      pages: 18,
      status: 'Restricted',
      foundDate: '04.05.1959',
      location: 'Ravine, 75m from cedar tree'
    },
    {
      id: 7,
      name: 'Alexander Kolevatov',
      title: 'Autopsy Report #7',
      date: '09.05.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-007',
      causeOfDeath: 'Hypothermia, multiple trauma',
      injuries: 'Deformed neck, missing eyes',
      pages: 15,
      status: 'Restricted',
      foundDate: '04.05.1959',
      location: 'Ravine, with Dubinina group'
    },
    {
      id: 8,
      name: 'Semyon Zolotaryov',
      title: 'Autopsy Report #8',
      date: '10.05.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-008',
      causeOfDeath: 'Massive chest trauma',
      injuries: 'Multiple rib fractures, flail chest, missing eyes',
      pages: 16,
      status: 'Restricted',
      foundDate: '04.05.1959',
      location: 'Ravine, with Dubinina and Kolevatov'
    },
    {
      id: 9,
      name: 'Nikolai Thibeaux-Brignolle',
      title: 'Autopsy Report #9',
      date: '10.05.1959',
      examiner: 'Dr. Boris Vozrozhdenny',
      bodyNumber: 'УТ-009',
      causeOfDeath: 'Severe skull fracture',
      injuries: 'Depressed skull fracture, brain damage',
      pages: 14,
      status: 'Restricted',
      foundDate: '04.05.1959',
      location: 'Ravine, near Dubinina group'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"
          />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Lock className="w-16 h-16 text-red-500" />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-3">ASSET LOCKED</h1>
          <p className="text-neutral-400 mb-6">
            You don't have access to this resource right now. Complete the investigation checkpoints to unlock restricted assets.
          </p>
          
          <motion.div
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-neutral-300">
              📋 Complete the <span className="text-blue-400 font-semibold">Soviet Archive</span> checkpoint to unlock medical records.
            </p>
          </motion.div>
          
          <button
            onClick={() => router.push('/soviet-archive')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
          >
            Back to Investigation
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      <header className="sticky top-0 z-50 bg-[#1a1a1b]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => router.push('/start')}
                className="p-2 hover:bg-white/10 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <Skull className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider font-mono">Forensic</div>
                <div className="text-sm sm:text-base font-bold truncate">Medical Records</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-950/30 border-l-4 border-red-500 rounded-r-lg"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                Forensic Medical Examination Records
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-400 mt-1 wrap-break-word">
                Medical Examiner: Dr. Boris Vozrozhdenny • Sverdlovsk Regional Forensic Laboratory • March-May 1959
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-white">{autopsyReports.length}</div>
            <div className="text-xs text-neutral-500 mt-1">Total Reports</div>
          </div>
          <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">{autopsyReports.filter(r => r.status === 'Complete').length}</div>
            <div className="text-xs text-neutral-500 mt-1">Complete</div>
          </div>
          <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-red-400">{autopsyReports.filter(r => r.status === 'Restricted').length}</div>
            <div className="text-xs text-neutral-500 mt-1">Restricted</div>
          </div>
          <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              {autopsyReports.reduce((sum, r) => sum + r.pages, 0)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">Total Pages</div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {autopsyReports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden hover:border-blue-500/30 transition-all"
            >
              <div className="p-3 sm:p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-white mb-1 wrap-break-word">
                            {report.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-400">{report.title} • Body #{report.bodyNumber}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] sm:text-xs px-2 py-1 rounded-full ${
                          report.status === 'Complete' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-neutral-500">Examined:</span>
                          <span className="text-white">{report.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-neutral-500">Pages:</span>
                          <span className="text-white">{report.pages}</span>
                        </div>
                      </div>

                      <div className="bg-white/5 p-2 sm:p-3 rounded-lg mb-3">
                        <div className="text-xs sm:text-sm mb-1">
                          <span className="text-neutral-500">Cause of Death:</span>
                          <span className="text-red-300 ml-2 font-medium wrap-break-word">{report.causeOfDeath}</span>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <span className="text-neutral-500">Key Injuries:</span>
                          <span className="text-white ml-2 wrap-break-word">{report.injuries}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs">
                        <MapPin className="w-3 h-3 text-neutral-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-neutral-500">Found {report.foundDate}:</span>
                          <span className="text-neutral-400 ml-1">{report.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
