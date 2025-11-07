'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, Newspaper, Lock, Calendar, Eye, Search, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SovietArchivePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('newspapers')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastVisit, setLastVisit] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [caseId, setCaseId] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [archiveData, setArchiveData] = useState({
    newspapers: [],
    reports: [],
    transfers: []
  })
  
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportAccessError, setReportAccessError] = useState('')
  const [reportCaseId, setReportCaseId] = useState('')
  const [reportPassword, setReportPassword] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportAction, setReportAction] = useState(null) // 'view' or 'download'

  const ARCHIVE_CASE_ID = '195902'
  const ARCHIVE_PASSWORD = 'sverdlovskoblastprosecutoroffice1959'


  useEffect(() => {
    const loadArchiveData = () => {
      
      const newspapers = [
        { id: 1, title: 'Soviet News Report - 1959', file: '/newspapers/1.png', category: 'newspapers', date: '1959-01-15' },
        { id: 2, title: 'Soviet News Report - 1959', file: '/newspapers/2.png', category: 'newspapers', date: '1959-02-20' },
        { id: 3, title: 'Soviet News Report - 1959', file: '/newspapers/3.png', category: 'newspapers', date: '1959-03-10' },
        { id: 4, title: 'Soviet News Report - 1959', file: '/newspapers/4.png', category: 'newspapers', date: '1959-04-05' },
        { id: 5, title: 'Soviet News Report - 1959', file: '/newspapers/5.png', category: 'newspapers', date: '1959-05-12' },
        { id: 6, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (1).jpg', category: 'newspapers', date: '1959-06-01' },
        { id: 7, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (2).jpg', category: 'newspapers', date: '1959-06-15' },
        { id: 8, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (3).jpg', category: 'newspapers', date: '1959-07-10' },
        { id: 9, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (4).jpg', category: 'newspapers', date: '1959-07-25' },
        { id: 10, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (5).jpg', category: 'newspapers', date: '1959-08-05' },
        { id: 11, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (6).jpg', category: 'newspapers', date: '1959-08-20' },
        { id: 12, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (7).jpg', category: 'newspapers', date: '1959-09-10' },
        { id: 13, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (8).jpg', category: 'newspapers', date: '1959-09-25' },
        { id: 14, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (9).jpg', category: 'newspapers', date: '1959-10-15' },
        { id: 15, title: 'Soviet News Report - 1959', file: '/newspapers/Newspaper (10).jpg', category: 'newspapers', date: '1959-11-01' },
      ]

     
      const reports = [
        { id: 1, title: 'Redacted Investigation Report', file: '/redacted_investigation_reports/1.pdf', category: 'reports', date: '1959-06-01', requiresAuth: true },
      ]

      const transfers = [
        { id: 1, title: 'Interdepartmental Transfer Note', file: '/interdepartmental_tranfer_report/2.pdf', category: 'transfers', date: '1959-05-28', requiresAuth: true },
      ]

      setArchiveData({
        newspapers,
        reports,
        transfers
      })
    }

    loadArchiveData()
  }, [])

  const handleArchiveLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    
   
    const normalizedCaseId = caseId.trim()
    const normalizedPassword = password.trim()
    
    console.log('[Soviet Archive Auth] Login attempt')
    console.log('[Soviet Archive Auth] Entered Case ID:', normalizedCaseId, 'Expected:', ARCHIVE_CASE_ID)
    console.log('[Soviet Archive Auth] Entered Password:', normalizedPassword, 'Expected:', ARCHIVE_PASSWORD)

    
    
    if (normalizedCaseId.toUpperCase() === ARCHIVE_CASE_ID.toUpperCase() && 
        normalizedPassword.toLowerCase() === ARCHIVE_PASSWORD.toLowerCase()) {
      console.log('[Soviet Archive Auth] ✅ Authentication successful!')
      setIsAuthenticated(true)
      sessionStorage.setItem('archiveAuthenticated', 'true')
      
      // Track this unlock as a progress event
      const trackArchiveUnlock = async () => {
        const participantId = localStorage.getItem('participantId')
        const teamId = localStorage.getItem('teamId')
        const participantType = localStorage.getItem('participantType')
        
        const id = participantType === 'team' ? teamId : participantId
        
        console.log('[Soviet Archive Auth] Tracking unlock - participantId:', id, 'type:', participantType)
        
        if (id) {
          try {
            const response = await fetch('/api/progress/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participantId: id,
                participantType: participantType,
                pageVisited: 'soviet-archive',
              }),
            })
            
            if (!response.ok) {
              console.error('[Soviet Archive Auth] Progress tracking failed:', response.status, response.statusText)
            } else {
              console.log('[Soviet Archive Auth] Progress tracking successful')
            }
          } catch (error) {
            console.error('[Soviet Archive Auth] Error tracking archive unlock:', error)
          }
        } else {
          console.warn('[Soviet Archive Auth] No participant ID found')
        }
      }
      
      trackArchiveUnlock()
    } else {
      console.log('[Soviet Archive Auth] ❌ Authentication failed - invalid credentials')
      setAuthError('Invalid Case ID or Password')
      setCaseId('')
      setPassword('')
    }
  }

  const handleReportAccess = (e, report, action) => {
    e.preventDefault()
    setReportAccessError('')
    
    // Case-insensitive comparison
    const normalizedCaseId = reportCaseId.trim()
    const normalizedPassword = reportPassword.trim()
    
    if (normalizedCaseId.toUpperCase() === ARCHIVE_CASE_ID.toUpperCase() && 
        normalizedPassword.toLowerCase() === ARCHIVE_PASSWORD.toLowerCase()) {
      console.log('[Report Access] ✅ Authentication successful!')
      
      // Proceed with view/download
      if (action === 'view') {
        window.open(report.file, '_blank')
      } else if (action === 'download') {
        const link = document.createElement('a')
        link.href = report.file
        link.download = report.title
        link.click()
      }
      
      // Reset and close modal
      setShowReportModal(false)
      setReportCaseId('')
      setReportPassword('')
      setSelectedReport(null)
      setReportAction(null)
    } else {
      console.log('[Report Access] ❌ Authentication failed - invalid credentials')
      setReportAccessError('Invalid Case ID or Password')
      setReportCaseId('')
      setReportPassword('')
    }
  }

  const handleReportClick = (report, action) => {
    setSelectedReport(report)
    setReportAction(action)
    setShowReportModal(true)
    setReportAccessError('')
    setReportCaseId('')
    setReportPassword('')
  }

  // Check if already authenticated in this session and set mounted
  useEffect(() => {
    const participantId = localStorage.getItem('participantId')
    const teamId = localStorage.getItem('teamId')

    if (!participantId && !teamId) {
      router.push('/register')
      return
    }

    const date = new Date().toLocaleDateString('ru-RU')
    setLastVisit(date)

    
    const authenticated = sessionStorage.getItem('archiveAuthenticated') === 'true'
    if (authenticated) {
      setIsAuthenticated(true)
    }

    setMounted(true)
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-stone-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Authentication lock screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-stone-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1a1a1b] border border-red-500/30 rounded-lg p-8 space-y-6">
            {/* Lock Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">Classified Archive</h1>
              <p className="text-sm text-neutral-400">Access Restricted - Authentication Required</p>
            </div>

            {/* Classification Banner */}
            <div className="p-3 bg-red-950/30 border border-red-500/20 rounded text-center">
              <p className="text-xs text-red-300 font-mono font-bold">
                CONFIDENTIAL // FOR AUTHORIZED PERSONNEL ONLY
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleArchiveLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                  Case ID
                </label>
                <input
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="Enter Case ID"
                  className="w-full px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                  Access Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
              >
                Unlock Archive
              </button>
            </form>

            {/* Footer */}
            <button
              onClick={() => router.push('/start')}
              className="w-full py-2 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-medium transition-colors"
            >
              Back to Investigation
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const allItems = [
    ...archiveData.newspapers,
    ...(isAuthenticated ? archiveData.reports : archiveData.reports.map(r => ({ ...r, locked: true }))),
    ...(isAuthenticated ? archiveData.transfers : archiveData.transfers.map(t => ({ ...t, locked: true })))
  ]

  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === item.category
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#d4c5a9] text-[#2a1f0f]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c4b59a' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}>
      
      <div className="border-t-4 border-[#8b0000]" />
      
      <header className="bg-[#2a1f0f] text-[#d4c5a9] border-b-4 border-[#8b0000]">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-2 md:gap-4 mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#8b0000] rounded-full flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 md:w-8 md:h-8 text-[#d4c5a9]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-wide break-words" style={{ fontFamily: 'Georgia, serif' }}>
                ГОСУДАРСТВЕННЫЙ АРХИВ СВЕРДЛОВСКОЙ ОБЛАСТИ
              </h1>
              <p className="text-xs md:text-sm mt-1 opacity-80">State Archive of Sverdlovsk Oblast</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs border-t border-[#d4c5a9]/20 pt-3 gap-2 md:gap-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <span>Catalog System v2.1</span>
              <span className="hidden md:inline">Last updated: {lastVisit}</span>
              <span className="md:hidden">Updated: {lastVisit}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              <span>Access Level: Public</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f5e6d3] border-4 border-[#8b0000] p-4 md:p-6 mb-6 md:mb-8 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-[#8b0000] shrink-0 mt-1" />
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold mb-2 break-words" style={{ fontFamily: 'Georgia, serif' }}>
                CASE FILE #195902-DPI
              </h2>
              <p className="text-sm leading-relaxed">
                Dyatlov Pass Incident Investigation Archive - February-May 1959
              </p>
              <p className="text-xs mt-2 opacity-70">
                Classification Status: Partially Declassified (1990) • Full Release Pending
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-[#f5e6d3] border-2 border-[#2a1f0f] p-4 sticky top-4">
              <h3 className="text-sm font-bold mb-3 md:mb-4 pb-2 border-b-2 border-[#8b0000]" style={{ fontFamily: 'Georgia, serif' }}>
                DOCUMENT CATEGORIES
              </h3>
              
              <nav className="space-y-1 md:space-y-2 mb-4 md:mb-6">
                {[
                  { id: 'newspapers', label: 'Newspapers (1959)', count: archiveData.newspapers.length },
                  { id: 'reports', label: `Police Documents${!isAuthenticated ? ' (Locked)' : ''}`, count: archiveData.reports.length },
                  { id: 'transfers', label: `Transfer Notes${!isAuthenticated ? ' (Locked)' : ''}`, count: archiveData.transfers.length }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-2 md:px-3 py-2 text-xs md:text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#8b0000] text-[#d4c5a9] font-bold'
                        : 'hover:bg-[#2a1f0f]/10'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="break-words">{cat.label}</span>
                      <span className="text-xs opacity-70 shrink-0">({cat.count})</span>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="pt-3 md:pt-4 border-t-2 border-[#2a1f0f]/20">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-2.5 text-[#2a1f0f]/50" />
                  <input
                    type="text"
                    placeholder="Search archives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs md:text-sm bg-white border-2 border-[#2a1f0f]/30 focus:border-[#8b0000] outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 md:mt-6 p-2 md:p-3 bg-[#8b0000]/10 border border-[#8b0000]/30 text-xs">
                <p className="font-bold mb-1">⚠️ NOTICE</p>
                <p className="opacity-80 leading-relaxed text-xs">
                  Documents marked "Restricted" require additional clearance. Contact archive administrator.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-[#f5e6d3] border-2 border-[#2a1f0f] p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b-2 border-[#8b0000]">
                <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-0 break-words" style={{ fontFamily: 'Georgia, serif' }}>
                  ARCHIVE CATALOG
                </h2>
                <div className="text-sm opacity-70 shrink-0">
                  {filteredItems.length} documents found
                </div>
              </div>

              <div className="space-y-3">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-[#2a1f0f]/50">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No documents match your search criteria</p>
                  </div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <motion.div
                      key={`${item.category}-${item.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border-2 transition-all p-3 md:p-4 ${
                        item.locked 
                          ? 'border-[#2a1f0f]/20 bg-gray-100 opacity-60' 
                          : 'border-[#2a1f0f]/20 bg-white hover:border-[#8b0000]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-4 gap-3">
                        <div className="flex gap-2 md:gap-3 flex-1 min-w-0">
                          <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#2a1f0f] flex items-center justify-center relative">
                            {item.category === 'newspapers' ? (
                              <Newspaper className="w-4 h-4 md:w-5 md:h-5 text-[#d4c5a9]" />
                            ) : (
                              <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#d4c5a9]" />
                            )}
                            {item.locked && (
                              <Lock className="w-2 h-2 md:w-3 md:h-3 text-red-500 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xs md:text-sm mb-1 wrap-break-word">
                              {item.title}
                              {item.locked && <span className="text-red-600 ml-2 text-xs">[RESTRICTED]</span>}
                            </h3>
                            <div className="flex flex-wrap gap-2 md:gap-3 text-xs opacity-70">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                {item.date}
                              </span>
                              <span>{item.file.endsWith('.pdf') ? 'PDF' : 'Image'}</span>
                            </div>
                            {item.locked && (
                              <div className="mt-2">
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 border border-red-300">
                                  Unlock Archive to View
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {!item.locked && (
                          <div className="flex gap-1 md:gap-2 shrink-0 w-full md:w-auto">
                            {item.category === 'reports' || item.category === 'transfers' ? (
                              <>
                                <button
                                  onClick={(e) => handleReportClick(item, 'view')}
                                  className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-2 bg-[#2a1f0f] text-[#d4c5a9] text-xs font-bold hover:bg-[#8b0000] transition-colors flex items-center justify-center md:gap-1 gap-0.5"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span className="hidden md:inline">View</span>
                                </button>
                                <button
                                  onClick={(e) => handleReportClick(item, 'download')}
                                  className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-2 border-2 border-[#2a1f0f] text-[#2a1f0f] text-xs font-bold hover:bg-[#2a1f0f] hover:text-[#d4c5a9] transition-colors flex items-center justify-center md:gap-1 gap-0.5"
                                >
                                  <Download className="w-3 h-3" />
                                  <span className="hidden md:inline">Download</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <a
                                  href={item.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-2 bg-[#2a1f0f] text-[#d4c5a9] text-xs font-bold hover:bg-[#8b0000] transition-colors flex items-center justify-center md:gap-1 gap-0.5"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span className="hidden md:inline">View</span>
                                </a>
                                <a
                                  href={item.file}
                                  download
                                  className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-2 border-2 border-[#2a1f0f] text-[#2a1f0f] text-xs font-bold hover:bg-[#2a1f0f] hover:text-[#d4c5a9] transition-colors flex items-center justify-center md:gap-1 gap-0.5"
                                >
                                  <Download className="w-3 h-3" />
                                  <span className="hidden md:inline">Download</span>
                                </a>
                              </>
                            )}
                          </div>
                        )}
                        {item.locked && (
                          <div className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-2 bg-gray-400 text-gray-600 text-xs font-bold cursor-not-allowed flex items-center justify-center md:gap-1 gap-0.5">
                            <Lock className="w-3 h-3" />
                            <span className="hidden md:inline">Locked</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#2a1f0f] text-[#d4c5a9] text-xs border-2 border-[#8b0000]">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                <span className="font-bold">Archive Access Information</span>
              </div>
              <p className="opacity-80 leading-relaxed">
                All documents in this archive are property of the State Archive of Sverdlovsk Oblast. 
                Reproduction, distribution, or unauthorized access is prohibited under Article 283 of the Criminal Code.
                For research inquiries, contact the archive administrator at archives@sverdlovsk.gov.ru
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Access Modal */}
      {showReportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReportModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f5e6d3] border-4 border-[#8b0000] w-full max-w-md p-4 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-4">
              <Lock className="w-5 h-5 md:w-6 md:h-6 text-[#8b0000]" />
              <h2 className="text-lg md:text-xl font-bold text-[#2a1f0f]" style={{ fontFamily: 'Georgia, serif' }}>
                SECURITY VERIFICATION
              </h2>
            </div>

            <p className="text-xs md:text-sm text-[#2a1f0f] mb-4">
              This is a restricted document. Please provide authentication credentials to {reportAction === 'view' ? 'view' : 'download'} this file.
            </p>

            <form onSubmit={(e) => handleReportAccess(e, selectedReport, reportAction)} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#2a1f0f] mb-1">Case ID</label>
                <input
                  type="text"
                  value={reportCaseId}
                  onChange={(e) => setReportCaseId(e.target.value)}
                  placeholder="Enter Case ID"
                  className="w-full px-2 md:px-3 py-2 text-xs md:text-sm bg-white border-2 border-[#2a1f0f]/30 focus:border-[#8b0000] outline-none text-[#2a1f0f]"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#2a1f0f] mb-1">Password</label>
                <input
                  type="password"
                  value={reportPassword}
                  onChange={(e) => setReportPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-2 md:px-3 py-2 text-xs md:text-sm bg-white border-2 border-[#2a1f0f]/30 focus:border-[#8b0000] outline-none text-[#2a1f0f]"
                />
              </div>

              {reportAccessError && (
                <div className="p-2 md:p-3 bg-red-100 border-2 border-red-300 rounded text-xs md:text-sm text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{reportAccessError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 md:py-3 bg-[#8b0000] hover:bg-[#a00000] text-[#d4c5a9] font-bold text-xs md:text-sm transition-colors"
              >
                {reportAction === 'view' ? 'View Document' : 'Download Document'}
              </button>

              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="w-full py-2 md:py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xs md:text-sm transition-colors"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      <footer className="bg-[#2a1f0f] text-[#d4c5a9] border-t-4 border-[#8b0000] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-6 text-xs">
            <div>
              <p className="text-xs md:text-sm">© 1959-2025 State Archive of Sverdlovsk Oblast</p>
              <p className="opacity-60 mt-1 text-xs">Ministry of Culture of the Russian Federation</p>
            </div>
            <div className="md:text-right">
              <p className="text-xs md:text-sm">Archive Reference: GASO Fund 2022</p>
              <p className="opacity-60 mt-1 text-xs">Екатеринбург • Yekaterinburg</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap');
        
        body {
          font-family: 'PT Serif', Georgia, serif;
        }
      `}</style>
    </div>
  )
}
