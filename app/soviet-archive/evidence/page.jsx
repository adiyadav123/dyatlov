'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, Image as ImageIcon, Volume2, AlertTriangle, Eye, Lock, Calendar, Play, Pause, Search, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function EvidencePage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(null)
  const [audioProgress, setAudioProgress] = useState({})

  // Track page visit as a checkpoint
  useEffect(() => {
    const trackEvidenceVisit = async () => {
      const participantId = localStorage.getItem('participantId')
      const teamId = localStorage.getItem('teamId')
      const participantType = localStorage.getItem('participantType')
      
      const id = participantType === 'team' ? teamId : participantId
      
      try { console.log('[Evidence Page] Tracking visit - participantId:', id, 'type:', participantType) } catch (e) {}
      
      if (id) {
        try {
          const response = await fetch('/api/progress/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId: id,
              participantType: participantType,
              pageVisited: 'evidence',
            }),
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            try { console.error('[Evidence Page] Progress tracking failed:', response.status, response.statusText, errorData) } catch (e) {}
          } else {
            try { console.log('[Evidence Page] Progress tracking successful') } catch (e) {}
          }
        } catch (error) {
          try { console.error('[Evidence Page] Error tracking visit:', error) } catch (e) {}
        }
      } else {
        try { console.warn('[Evidence Page] No participant ID found') } catch (e) {}
      }
    }

    trackEvidenceVisit()
  }, [])

  const diaries = [
    { id: 1, title: 'Yuri Doroshenko Diary Entry', date: '28.01.1959', category: 'diary', file: 'evidences/diaries/Yuri\'s Diary Entry.pdf', condition: 'Good', location: 'Found in tent' },
    { id: 2, title: 'Lyudmila Dubinina Journal Entries', date: '23.01.1959', category: 'diary', file: 'evidences/diaries/Lyudmila\'s Diary Entry.pdf', condition: 'Water Damaged', location: 'Found near body' },
    { id: 3, title: 'Semyon Zolotarev Field Notes', date: '25.01.1959', category: 'diary', file: 'evidences/diaries/Semyon\'s Diary Entry.pdf', condition: 'Partially Legible', location: 'Retrieved from cedar tree area' },
    { id: 4, title: 'Georgiy Krivonischenko Personal Diary Fragment', date: '24.01.1959', category: 'diary', file: 'evidences/diaries/Georgiy\'s Diary Entry.pdf', condition: 'Good', location: 'Found in ravine' }
  ]

  const images = [
    { id: 1, title: 'Damaged Photographic Negative #17', date: '01.02.1959', category: 'image', file: 'evidences/damaged_negative.jpg', type: 'Negative Film', resolution: 'Unknown', notes: 'Partially exposed, unclear subject matter' },
    { id: 2, title: 'Last Known Photograph of Group', date: '01.02.1959', category: 'image', file: 'evidences/itshim.png', type: 'Black & White Print', resolution: '4x6 inches', notes: 'Taken hours before incident' }
  ]

  const audio = [
    { id: 1, title: 'Radio Transmission - Dyatlov to Base Camp', date: '31.01.1959', category: 'audio', duration: '2:34', quality: 'Poor - Heavy Static', transcribed: true }
  ]

  const allItems = [...diaries, ...images, ...audio]

  const filteredItems = allItems.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory
  })

  const handlePlayAudio = (id) => {
    if (audioPlaying === id) {
      setAudioPlaying(null)
    } else {
      setAudioPlaying(id)
    }
  }

  const handleViewItem = async (item) => {
    if (item.file) {
      try {
        const response = await fetch('/api/protected?file=' + encodeURIComponent(item.file))
        if (!response.ok) throw new Error('Failed to load file')
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        if (item.file.endsWith('.pdf')) {
          window.open(url, '_blank')
        } else {
          // For images, set in modal
          setSelectedItem({ ...item, preview: url })
          setShowModal(true)
        }
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 100)
      } catch (err) {
        try { console.error('[Evidence] Error loading file:', err) } catch (e) {}
        alert('Failed to load file')
      }
    } else {
      setSelectedItem(item)
      setShowModal(true)
    }
  }

  const handleDownloadItem = async (item) => {
    if (item.file) {
      try {
        const response = await fetch('/api/protected?file=' + encodeURIComponent(item.file))
        if (!response.ok) throw new Error('Failed to download file')
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = item.title + (item.file.endsWith('.pdf') ? '.pdf' : item.file.slice(item.file.lastIndexOf('.')))
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } catch (err) {
        try { console.error('[Evidence] Error downloading file:', err) } catch (e) {}
        alert('Failed to download file')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#d4c5a9] text-[#2a1f0f]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c4b59a' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}>
      
      <div className="border-t-2 sm:border-t-4 border-[#8b0000]" />
      
      <header className="bg-[#2a1f0f] text-[#d4c5a9] border-b-2 sm:border-b-4 border-[#8b0000]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <button
              onClick={() => router.push('/soviet-archive')}
              className="p-2 hover:bg-[#d4c5a9]/10 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[#8b0000] rounded-full flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 sm:w-8 sm:h-8 text-[#d4c5a9]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-bold tracking-wide truncate" style={{ fontFamily: 'Georgia, serif' }}>
                PHYSICAL EVIDENCE ARCHIVE
              </h1>
              <p className="text-[10px] sm:text-sm mt-0.5 sm:mt-1 opacity-80 truncate">Dyatlov Pass Incident • Case #195902-DPI</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[9px] sm:text-xs border-t border-[#d4c5a9]/20 pt-2 sm:pt-3 gap-2 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-6">
              <span>Evidence Catalog</span>
              <span className="hidden sm:inline">Restricted Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Retrieved: Feb-May 1959</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f5e6d3] border-2 sm:border-4 border-[#8b0000] p-3 sm:p-6 mb-4 sm:mb-8 shadow-lg"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-[#8b0000] shrink-0 mt-0.5 sm:mt-1" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-bold mb-1 sm:mb-2 break-words" style={{ fontFamily: 'Georgia, serif' }}>
                EVIDENCE HANDLING PROTOCOL
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed break-words">
                All items listed below were recovered from the incident site between February 26 and May 4, 1959. 
                Physical evidence is stored in controlled environment. Access requires clearance authorization.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-[#f5e6d3] border-2 border-[#2a1f0f] p-3 sm:p-4 sticky top-4">
              <h3 className="text-sm font-bold mb-3 sm:mb-4 pb-2 border-b-2 border-[#8b0000]" style={{ fontFamily: 'Georgia, serif' }}>
                EVIDENCE TYPES
              </h3>
              
              <nav className="space-y-2">
                {[
                  { id: 'all', label: 'All Evidence', count: allItems.length },
                  { id: 'diary', label: 'Personal Diaries', count: diaries.length },
                  { id: 'image', label: 'Photographic', count: images.length },
                  { id: 'audio', label: 'Audio Recordings', count: audio.length }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#8b0000] text-[#d4c5a9] font-bold'
                        : 'hover:bg-[#2a1f0f]/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{cat.label}</span>
                      <span className="text-xs opacity-70 ml-2">({cat.count})</span>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="mt-4 sm:mt-6 p-3 bg-[#8b0000]/10 border border-[#8b0000]/30 text-xs">
                <p className="font-bold mb-1">⚠️ NOTICE</p>
                <p className="opacity-80 leading-relaxed">
                  Original documents are fragile. Digital copies provided for research purposes only.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-[#f5e6d3] border-2 border-[#2a1f0f] p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#8b0000] gap-2">
                <h2 className="text-base sm:text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                  EVIDENCE CATALOG
                </h2>
                <div className="text-xs sm:text-sm opacity-70">
                  {filteredItems.length} items
                </div>
              </div>

              <div className="space-y-3">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-[#2a1f0f]/50">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No evidence found</p>
                  </div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <motion.div
                      key={`${item.category}-${item.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-2 border-[#2a1f0f]/20 bg-white hover:border-[#8b0000] transition-all p-3 sm:p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#2a1f0f] flex items-center justify-center">
                            {item.category === 'diary' && <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4c5a9]" />}
                            {item.category === 'image' && <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4c5a9]" />}
                            {item.category === 'audio' && <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4c5a9]" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xs sm:text-sm mb-1 break-words leading-snug">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs opacity-70">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {item.date}
                              </span>
                              {item.pages && <span>{item.pages} pages</span>}
                              {item.duration && <span>{item.duration}</span>}
                              {item.type && <span>{item.type}</span>}
                            </div>
                            {item.condition && (
                              <div className="mt-2">
                                <span className={`text-[10px] sm:text-xs px-2 py-0.5 inline-block ${
                                  item.condition === 'Good' 
                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                    : item.condition.includes('Damaged')
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                }`}>
                                  {item.condition}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0 justify-end">
                          {item.category === 'audio' ? (
                            <button
                              onClick={() => handlePlayAudio(item.id)}
                              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-[#2a1f0f] text-[#d4c5a9] text-[10px] sm:text-xs font-bold hover:bg-[#8b0000] transition-colors flex items-center gap-1"
                            >
                              {audioPlaying === item.id ? (
                                <>
                                  <Pause className="w-3 h-3" />
                                  <span className="hidden sm:inline">Pause</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3" />
                                  <span className="hidden sm:inline">Play</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleViewItem(item)}
                                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-[#2a1f0f] text-[#d4c5a9] text-[10px] sm:text-xs font-bold hover:bg-[#8b0000] transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                              <button
                                onClick={() => handleDownloadItem(item)}
                                className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#2a1f0f] text-[#2a1f0f] text-[10px] sm:text-xs font-bold hover:bg-[#2a1f0f] hover:text-[#d4c5a9] transition-colors flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {item.category === 'audio' && audioPlaying === item.id && (
                        <div className="mt-3 pt-3 border-t border-[#2a1f0f]/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-1 bg-[#2a1f0f]/20 rounded-full overflow-hidden">
                              <div className="h-full bg-[#8b0000] rounded-full" style={{ width: '45%' }} />
                            </div>
                            <span className="text-xs font-mono">1:08 / {item.duration}</span>
                          </div>
                          {item.transcribed && (
                            <div className="mt-2 p-2 bg-[#2a1f0f]/5 border border-[#2a1f0f]/20 rounded text-xs">
                              <p className="font-bold mb-1">Transcript:</p>
                              <p className="text-[11px] leading-relaxed italic opacity-80">
                                "[Heavy static]... Base camp, this is Dyatlov... weather worsening... 
                                proceed as planned... [interference]... will report tomorrow... [transmission ends]"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {item.location && (
                        <div className="mt-2 pt-2 border-t border-[#2a1f0f]/20 text-[10px] sm:text-xs opacity-70">
                          <span className="font-bold">Recovery Location:</span> {item.location}
                        </div>
                      )}

                      {item.notes && (
                        <div className="mt-2 pt-2 border-t border-[#2a1f0f]/20 text-[10px] sm:text-xs opacity-70">
                          <span className="font-bold">Notes:</span> {item.notes}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#2a1f0f] text-[#d4c5a9] text-[10px] sm:text-xs border-2 border-[#8b0000]">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-bold">Evidence Chain of Custody</span>
              </div>
              <p className="opacity-80 leading-relaxed break-words">
                All evidence documented and preserved according to Soviet Criminal Code Article 182. 
                Original items stored at Regional Forensic Laboratory, Sverdlovsk. Access restricted to authorized personnel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f5e6d3] border-4 border-[#8b0000] p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base sm:text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                {selectedItem.title}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl font-bold hover:text-[#8b0000] transition-colors"
              >
                ×
              </button>
            </div>

            <div className="bg-white border-2 border-[#2a1f0f]/20 p-4 mb-4 min-h-64 flex items-center justify-center">
              {selectedItem.category === 'image' ? (
                selectedItem.preview ? (
                  <img src={selectedItem.preview} alt={selectedItem.title} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p className="text-sm opacity-70">Image preview unavailable</p>
                    <p className="text-xs opacity-50 mt-1">Original film requires specialized viewing equipment</p>
                  </div>
                )
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm opacity-70">PDF viewer would load here</p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-[#2a1f0f]/20">
                <span className="font-bold">Date:</span>
                <span>{selectedItem.date}</span>
              </div>
              {selectedItem.pages && (
                <div className="flex justify-between py-2 border-b border-[#2a1f0f]/20">
                  <span className="font-bold">Pages:</span>
                  <span>{selectedItem.pages}</span>
                </div>
              )}
              {selectedItem.condition && (
                <div className="flex justify-between py-2 border-b border-[#2a1f0f]/20">
                  <span className="font-bold">Condition:</span>
                  <span>{selectedItem.condition}</span>
                </div>
              )}
              {selectedItem.location && (
                <div className="flex justify-between py-2 border-b border-[#2a1f0f]/20">
                  <span className="font-bold">Found:</span>
                  <span className="text-right break-words">{selectedItem.location}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 px-4 py-2 bg-[#2a1f0f] text-[#d4c5a9] font-bold hover:bg-[#8b0000] transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      <footer className="bg-[#2a1f0f] text-[#d4c5a9] border-t-2 sm:border-t-4 border-[#8b0000] mt-6 sm:mt-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] sm:text-xs gap-3 sm:gap-0">
            <div>
              <p>© 1959-2025 State Archive • Evidence Division</p>
              <p className="opacity-60 mt-1">Ministry of Internal Affairs</p>
            </div>
            <div className="sm:text-right">
              <p>Case #195902-DPI</p>
              <p className="opacity-60 mt-1">Classified Material</p>
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
