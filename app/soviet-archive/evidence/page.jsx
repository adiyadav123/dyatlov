'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowLeft, Search, Pin, Paperclip, AlertCircle, Lock as LockIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EvidencePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [caseId, setCaseId] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  
  // Investigation board state
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [connections, setConnections] = useState([])
  const [unlockedItems, setUnlockedItems] = useState({})
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [challengeAnswer, setChallengeAnswer] = useState('')
  const [challengeError, setChallengeError] = useState('')
  const [loadingChallenge, setLoadingChallenge] = useState(false)
  const [viewingEvidence, setViewingEvidence] = useState(null)
  const [connectionMode, setConnectionMode] = useState(false)
  const [selectedForConnection, setSelectedForConnection] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [particles, setParticles] = useState([])
  const [newConnectionAnim, setNewConnectionAnim] = useState(null)
  const [showHint, setShowHint] = useState(false)

  const EVIDENCE_CASE_ID = '195902'
  const EVIDENCE_PASSWORD = 'sverdlovskoblastprosecutoroffice1959'

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('evidence_progress')
    if (savedProgress) {
      try {
        setUnlockedItems(JSON.parse(savedProgress))
      } catch (e) {
        console.error('Failed to load progress:', e)
      }
    }

    const savedConnections = localStorage.getItem('evidence_connections')
    if (savedConnections) {
      try {
        setConnections(JSON.parse(savedConnections))
      } catch (e) {
        console.error('Failed to load connections:', e)
      }
    }
  }, [])

  // Save progress whenever unlockedItems changes
  useEffect(() => {
    if (Object.keys(unlockedItems).length > 0) {
      localStorage.setItem('evidence_progress', JSON.stringify(unlockedItems))
    }
  }, [unlockedItems])

  // Save connections whenever they change
  useEffect(() => {
    if (connections.length > 0) {
      localStorage.setItem('evidence_connections', JSON.stringify(connections))
    }
  }, [connections])

  // Evidence items on the board
  const evidenceItems = [
    // ===== DIARIES (4 items) =====
    {
      id: 'yuri-diary',
      type: 'diary',
      title: "Yuri's Journal",
      locked: true,
      position: { top: '8%', left: '8%' },
      rotation: -3,
      color: 'bg-amber-100',
      file: 'evidences/diaries/Yuri\'s Diary Entry.pdf',
      pin: 'red',
      layers: 1,
      wikiPage: '/investigation/yuri-doroshenko'
    },
    {
      id: 'lyudmila-diary',
      type: 'diary',
      title: "Lyudmila's Notes",
      locked: true,
      position: { top: '8%', left: '78%' },
      rotation: 2,
      color: 'bg-blue-50',
      file: 'evidences/diaries/Lyudmila\'s Diary Entry.pdf',
      pin: 'blue',
      layers: 1,
      wikiPage: '/investigation/lyudmila-dubinina'
    },
    {
      id: 'semyon-diary',
      type: 'diary',
      title: "Semyon's Field Notes",
      locked: true,
      position: { top: '70%', left: '75%' },
      rotation: -4,
      color: 'bg-gray-100',
      file: 'evidences/diaries/Semyon\'s Diary Entry.pdf',
      pin: 'yellow',
      layers: 1,
      wikiPage: '/investigation/semyon-zolotaryov'
    },
    {
      id: 'georgiy-diary',
      type: 'diary',
      title: "Georgiy's Personal Log",
      locked: true,
      position: { top: '70%', left: '8%' },
      rotation: 3,
      color: 'bg-green-50',
      file: 'evidences/diaries/Georgiy\'s Diary Entry.pdf',
      pin: 'green',
      layers: 1,
      wikiPage: '/investigation/georgiy-krivonischenko'
    },

    // ===== PHOTOS (2 unlocked) =====
    {
      id: 'blood-message',
      type: 'photo',
      title: 'Evidence Photo #A-47',
      locked: false,
      position: { top: '5%', left: '43%' },
      rotation: -2,
      color: 'bg-white',
      file: 'evidences/itshim.png',
      pin: 'red',
      preview: true
    },
    {
      id: 'negative',
      type: 'photo',
      title: 'Damaged Film Negative',
      locked: false,
      position: { top: '40%', left: '15%' },
      rotation: 1,
      color: 'bg-gray-200',
      file: 'evidences/damaged_negative.jpg',
      pin: 'black',
      preview: true
    }
  ]

  const handleEvidenceLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (caseId.trim().toUpperCase() === EVIDENCE_CASE_ID.toUpperCase() && 
        password.trim().toLowerCase() === EVIDENCE_PASSWORD.toLowerCase()) {
      setIsAuthenticated(true)
    } else {
      setAuthError('Access Denied - Invalid Credentials')
    }
  }

  const handleEvidenceClick = async (item) => {
    if (connectionMode) {
      handleConnectionClick(item)
      return
    }

    // Check if item requires wiki hunt
    if (item.wikiPage && item.locked && !unlockedItems[item.id]?.unlocked) {
      // Check if user has unlock token from wiki
      const unlockToken = localStorage.getItem(`unlock_${item.id.replace('-', '_')}`)
      if (unlockToken === 'true') {
        // Auto-unlock the item
        setUnlockedItems(prev => ({
          ...prev,
          [item.id]: { unlocked: true, layer: item.layers, viewed: false }
        }))
        viewEvidence(item)
      } else {
        // Redirect to wiki page
        router.push(item.wikiPage)
      }
      return
    }

    if (item.locked && !unlockedItems[item.id]?.unlocked) {
      // Generate challenge from puzzle
      await generateChallenge(item)
    } else {
      // View unlocked evidence
      viewEvidence(item)
    }
  }

  const handleConnectionClick = (item) => {
    if (!selectedForConnection) {
      setSelectedForConnection(item)
      playSound('click')
    } else if (selectedForConnection.id === item.id) {
      setSelectedForConnection(null)
    } else {
      // Create connection
      const newConnection = {
        from: selectedForConnection.id,
        to: item.id,
        fromPos: selectedForConnection.position,
        toPos: item.position,
        timestamp: Date.now()
      }
      
      // Check if connection already exists
      const exists = connections.some(
        c => (c.from === newConnection.from && c.to === newConnection.to) || 
             (c.from === newConnection.to && c.to === newConnection.from)
      )
      
      if (!exists) {
        setConnections(prev => [...prev, newConnection])
        playSound('connect')
        
        // Animate new connection
        setNewConnectionAnim(newConnection)
        setTimeout(() => setNewConnectionAnim(null), 1000)
        
        // Create particle effect
        createParticles(item)
      }
      
      setSelectedForConnection(null)
      setConnectionMode(false)
    }
  }

  const createParticles = (item) => {
    const posX = parseFloat(item.position.left) || 50
    const posY = parseFloat(item.position.top) || 50
    
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: posX,
      y: posY,
      angle: (Math.PI * 2 * i) / 12,
      velocity: 2 + Math.random() * 2
    }))
    
    setParticles(prev => [...prev, ...newParticles])
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
    }, 1000)
  }

  const playSound = (type) => {
    try {
      const audio = new Audio()
      if (type === 'click') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2E='
      } else if (type === 'connect') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LD='
      } else if (type === 'success') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZOR0'
      } else if (type === 'error') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZOR0'
      } else if (type === 'unlock') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZOR0'
      }
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch (e) {
      // Silently fail
    }
  }

  const removeConnection = (index) => {
    setConnections(prev => prev.filter((_, i) => i !== index))
  }

  const generateChallenge = async (item) => {
    setLoadingChallenge(true)
    setSelectedEvidence(item)
    setChallengeAnswer('')
    setChallengeError('')
    
    try {
      const response = await fetch('/api/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          itemTitle: item.title,
          itemType: item.type,
          currentLayer: (unlockedItems[item.id]?.layer || 0) + 1,
          totalLayers: item.layers,
          puzzleType: item.puzzle || 'cipher',
          storyContext: {
            incident: 'Dyatlov Pass 1959',
            theme: 'dissociative identity, Soviet cover-up, hidden truth',
            characters: ['Yuri', 'Semyon', 'Lyudmila', 'Georgiy', 'Igor']
          }
        }),
      })
      
      const data = await response.json()
      setCurrentChallenge(data)
    } catch (error) {
      setChallengeError('Unable to access this evidence. System error.')
    } finally {
      setLoadingChallenge(false)
    }
  }

  const submitChallengeAnswer = async () => {
    if (!currentChallenge) return
    
    try {
      const response = await fetch('/api/verify-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          answer: challengeAnswer.trim(),
          itemId: selectedEvidence.id
        }),
      })
      
      const data = await response.json()
      
      if (data.correct) {
        const currentLayer = (unlockedItems[selectedEvidence.id]?.layer || 0) + 1
        
        // Success sound
        playSound('success')
        
        if (currentLayer >= selectedEvidence.layers) {
          // Fully unlocked
          setUnlockedItems(prev => ({
            ...prev,
            [selectedEvidence.id]: { unlocked: true, layer: currentLayer, viewed: false }
          }))
          
          // Victory animation
          setTimeout(() => {
            playSound('unlock')
            viewEvidence(selectedEvidence)
            setSelectedEvidence(null)
            setCurrentChallenge(null)
          }, 1000)
        } else {
          // Next layer
          setUnlockedItems(prev => ({
            ...prev,
            [selectedEvidence.id]: { unlocked: false, layer: currentLayer }
          }))
          
          // Generate next challenge
          setTimeout(() => generateChallenge(selectedEvidence), 500)
        }
        
        setChallengeError('')
        setChallengeAnswer('')
      } else {
        setChallengeError('Incorrect. Think harder.')
        playSound('error')
      }
    } catch (error) {
      setChallengeError('Verification failed.')
      playSound('error')
    }
  }

  const viewEvidence = async (item) => {
    try {
      const response = await fetch('/api/protected?file=' + encodeURIComponent(item.file))
      if (!response.ok) throw new Error('Failed to load')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      if (item.file.endsWith('.pdf')) {
        window.open(url, '_blank')
        // Mark as viewed
        setUnlockedItems(prev => ({
          ...prev,
          [item.id]: { ...prev[item.id], viewed: true }
        }))
      } else if (item.file.endsWith('.mp3')) {
        // Show audio player modal
        setViewingEvidence({ ...item, url, type: 'audio' })
        setUnlockedItems(prev => ({
          ...prev,
          [item.id]: { ...prev[item.id], viewed: true }
        }))
      } else {
        // Show image modal
        setViewingEvidence({ ...item, url, type: 'image' })
        setUnlockedItems(prev => ({
          ...prev,
          [item.id]: { ...prev[item.id], viewed: true }
        }))
      }
      
      setTimeout(() => {
        if (item.file.endsWith('.pdf')) {
          URL.revokeObjectURL(url)
        }
      }, 100)
    } catch (err) {
      alert('Failed to load evidence')
    }
  }

  const calculateStats = () => {
    const totalItems = evidenceItems.length
    const unlockedCount = Object.values(unlockedItems).filter(item => item.unlocked).length
    const viewedCount = Object.values(unlockedItems).filter(item => item.viewed).length
    const totalLayers = evidenceItems.reduce((sum, item) => sum + (item.layers || 0), 0)
    const unlockedLayers = Object.values(unlockedItems).reduce((sum, item) => sum + (item.layer || 0), 0)
    
    return {
      totalItems,
      unlockedCount,
      viewedCount,
      totalLayers,
      unlockedLayers,
      connections: connections.length
    }
  }

  const resetProgress = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      setUnlockedItems({})
      setConnections([])
      localStorage.removeItem('evidence_progress')
      localStorage.removeItem('evidence_connections')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#2a1f0f] flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#f5e6d3] border-4 sm:border-8 border-[#4a3f2f] p-4 sm:p-6 md:p-8 shadow-2xl"
          style={{
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.5)'
          }}
        >
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-[#8b0000] rounded-full flex items-center justify-center border-4 border-[#2a1f0f]">
              <span className="text-3xl sm:text-4xl">🔒</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2a1f0f] font-['Courier_New'] tracking-wider">
              CASE FILE ACCESS
            </h1>
            <p className="text-xs sm:text-sm text-[#2a1f0f]/60 mt-2 font-['Courier_New']">
              CLASSIFIED - AUTHORIZED ONLY
            </p>
          </div>

          <form onSubmit={handleEvidenceLogin} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2 text-[#2a1f0f] font-['Courier_New']">
                CASE ID
              </label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 border-[#2a1f0f] text-[#2a1f0f] font-['Courier_New'] focus:outline-none focus:border-[#8b0000]"
                placeholder="XXXXXX"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2 text-[#2a1f0f] font-['Courier_New']">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 border-[#2a1f0f] text-[#2a1f0f] font-['Courier_New'] focus:outline-none focus:border-[#8b0000]"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="p-2 sm:p-3 bg-[#8b0000] text-white text-xs sm:text-sm font-['Courier_New']">
                ⚠ {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 sm:py-3 text-sm sm:text-base bg-[#8b0000] text-white font-bold font-['Courier_New'] hover:bg-[#6b0000] transition-colors"
            >
              AUTHENTICATE
            </button>
          </form>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#2a1f0f]/10 border-2 border-[#2a1f0f]">
            <p className="text-[10px] sm:text-xs text-[#2a1f0f]/70 font-['Courier_New']">
              Credentials located in Soviet Archive documents
            </p>
          </div>

          <button
            onClick={() => router.push('/soviet-archive')}
            className="w-full mt-3 sm:mt-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#2a1f0f] text-[#2a1f0f] font-bold font-['Courier_New'] hover:bg-[#2a1f0f]/10"
          >
            ← RETURN TO ARCHIVE
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes particle {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), var(--dy));
            opacity: 0;
          }
        }

        @keyframes drawLine {
          0% {
            stroke-dashoffset: 100;
            opacity: 0.3;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
          }
          50% {
            box-shadow: 0 0 25px rgba(220, 38, 38, 1);
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-[#3d352b] relative overflow-hidden">
      {/* Cork texture background */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundColor: '#b89968'
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 bg-[#2a1f0f] border-b-4 border-[#1a1410] shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => router.push('/soviet-archive')}
            className="flex items-center gap-1 sm:gap-2 text-[#d4c5a9] hover:text-white transition-colors font-['Courier_New'] text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">ARCHIVE</span>
            <span className="sm:hidden">BACK</span>
          </button>
          
          <h1 className="text-sm sm:text-xl md:text-2xl font-bold text-[#d4c5a9] font-['Courier_New'] tracking-widest">
            <span className="hidden md:inline">EVIDENCE BOARD // CASE #195902</span>
            <span className="hidden sm:inline md:hidden">CASE #195902</span>
            <span className="sm:hidden">EVIDENCE</span>
          </h1>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-2 sm:px-3 py-1 bg-[#8b0000] text-white text-xs sm:text-sm font-['Courier_New'] hover:bg-[#6b0000] transition-colors"
            >
              STATS
            </button>
            <button
              onClick={() => {
                setConnectionMode(!connectionMode)
                setSelectedForConnection(null)
              }}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-['Courier_New'] transition-colors ${
                connectionMode 
                  ? 'bg-[#8b0000] text-white' 
                  : 'bg-[#d4c5a9] text-[#2a1f0f] hover:bg-white'
              }`}
            >
              {connectionMode ? 'EXIT' : 'CONNECT'}
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#1a1410] border-t-2 border-[#8b0000]"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 text-center font-['Courier_New']">
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-[#8b0000]">
                      {calculateStats().unlockedCount}/{calculateStats().totalItems}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#d4c5a9]">UNLOCKED</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-green-500">
                      {calculateStats().viewedCount}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#d4c5a9]">VIEWED</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-yellow-500">
                      {calculateStats().unlockedLayers}/{calculateStats().totalLayers}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#d4c5a9]">LAYERS</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-400">
                      {calculateStats().connections}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#d4c5a9]">CONNECTS</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-purple-400">
                      {Math.round((calculateStats().unlockedCount / calculateStats().totalItems) * 100)}%
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#d4c5a9]">PROGRESS</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={resetProgress}
                      className="text-xs sm:text-sm text-red-400 hover:text-red-300 underline"
                    >
                      RESET
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection Mode Banner */}
        <AnimatePresence>
          {connectionMode && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-[#8b0000] text-white text-center py-2 px-3 font-['Courier_New'] text-xs sm:text-sm"
            >
              <span className="hidden md:inline">
                {selectedForConnection 
                  ? `SELECTED: ${selectedForConnection.title.toUpperCase()} → CLICK ANOTHER ITEM TO CONNECT`
                  : 'CONNECTION MODE: CLICK TWO ITEMS TO CONNECT THEM'}
              </span>
              <span className="md:hidden">
                {selectedForConnection 
                  ? `${selectedForConnection.title} → Tap another`
                  : 'Tap two items to connect'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Investigation Board */}
      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-6 md:p-8 min-h-[calc(100vh-80px)]">
        
        {/* Mobile Grid View */}
        <div className="sm:hidden grid grid-cols-2 gap-4 pb-20">
          {evidenceItems.map((item) => {
            const isUnlocked = unlockedItems[item.id]?.unlocked
            const isViewed = unlockedItems[item.id]?.viewed
            const currentLayer = unlockedItems[item.id]?.layer || 0
            const isSelected = selectedForConnection?.id === item.id
            
            return (
              <motion.div
                key={item.id}
                className={`cursor-pointer ${isSelected ? 'ring-4 ring-[#8b0000]' : ''}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEvidenceClick(item)}
              >
                <div className={`${item.color} p-3 shadow-lg border-2 ${
                  isSelected ? 'border-[#8b0000] border-4' : 'border-gray-300'
                }`}>
                  {item.locked && !isUnlocked && (
                    <div className="absolute top-1 right-1 bg-[#8b0000] text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                      {item.layers - currentLayer}
                    </div>
                  )}
                  {isViewed && (
                    <div className="absolute top-1 left-1 bg-green-600 text-white px-1.5 py-0.5 rounded-full text-[8px] font-bold">
                      ✓
                    </div>
                  )}
                  {item.preview && (
                    <div className="w-full h-24 bg-gray-200 mb-2 border border-gray-400 overflow-hidden">
                      <img 
                        src={`/api/protected?file=${encodeURIComponent(item.file)}`} 
                        className="w-full h-full object-cover opacity-80"
                        alt=""
                      />
                    </div>
                  )}
                  <p className="text-xs font-bold text-center text-gray-900 line-clamp-2 mb-1">
                    {item.title}
                  </p>
                  <div className="text-[10px] text-center text-gray-600">
                    {item.type === 'diary' && '📔 DIARY'}
                    {item.type === 'photo' && '📷 PHOTO'}
                    {item.type === 'audio' && '🔊 AUDIO'}
                    {item.type === 'medical' && '⚕️ MEDICAL'}
                    {item.type === 'report' && '📋 REPORT'}
                    {item.type === 'document' && '📄 DOC'}
                    {item.type === 'newspaper' && '📰 NEWS'}
                  </div>
                  {isUnlocked && (
                    <div className="mt-1 text-center text-green-700 font-bold text-[10px]">
                      ✓ UNLOCKED
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Desktop Cork Board View */}
        <div className="hidden sm:block relative w-full h-full min-h-[800px]">
        
        {/* Red string connections (rendered as SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <filter id="rough">
              <feTurbulence baseFrequency="0.05" numOctaves="2" />
              <feDisplacementMap in="SourceGraphic" scale="2" />
            </filter>
          </defs>
          {connections.map((conn, idx) => {
            // Calculate center positions of evidence items
            const fromItem = evidenceItems.find(item => item.id === conn.from)
            const toItem = evidenceItems.find(item => item.id === conn.to)
            
            if (!fromItem || !toItem) return null
            
            // Convert percentage to pixels (approximate based on container)
            const containerWidth = typeof window !== 'undefined' ? window.innerWidth * 0.875 : 1200
            const containerHeight = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800
            
            const fromX = (parseFloat(conn.fromPos.left) / 100) * containerWidth + 96
            const fromY = (parseFloat(conn.fromPos.top) / 100) * containerHeight + 64
            const toX = (parseFloat(conn.toPos.left) / 100) * containerWidth + 96
            const toY = (parseFloat(conn.toPos.top) / 100) * containerHeight + 64
            
            return (
              <g key={idx}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#8b0000"
                  strokeWidth="2"
                  filter="url(#rough)"
                  opacity="0.6"
                  className="cursor-pointer hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Remove this connection?')) {
                      removeConnection(idx)
                    }
                  }}
                  style={{ pointerEvents: 'stroke' }}
                />
                {/* Connection dots */}
                <circle cx={fromX} cy={fromY} r="4" fill="#8b0000" opacity="0.8" />
                <circle cx={toX} cy={toY} r="4" fill="#8b0000" opacity="0.8" />
              </g>
            )
          })}
        </svg>

        {/* Particle Effects */}
        {particles.map(particle => {
          const containerWidth = typeof window !== 'undefined' ? window.innerWidth * 0.875 : 1200
          const containerHeight = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800
          const x = (particle.x / 100) * containerWidth + 96
          const y = (particle.y / 100) * containerHeight + 64
          const dx = Math.cos(particle.angle) * particle.velocity * 50
          const dy = Math.sin(particle.angle) * particle.velocity * 50
          
          return (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-red-500 rounded-full pointer-events-none"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                animation: 'particle 1s ease-out forwards',
                '--dx': `${dx}px`,
                '--dy': `${dy}px`,
                zIndex: 10
              }}
            />
          )
        })}

        {/* Evidence items */}
        {evidenceItems.map((item) => {
          const isUnlocked = unlockedItems[item.id]?.unlocked
          const isViewed = unlockedItems[item.id]?.viewed
          const currentLayer = unlockedItems[item.id]?.layer || 0
          const isSelected = selectedForConnection?.id === item.id
          
          return (
            <motion.div
              key={item.id}
              className={`absolute cursor-pointer group ${isSelected ? 'z-20' : ''}`}
              style={{
                top: item.position.top,
                left: item.position.left,
                transform: `rotate(${item.rotation}deg)`,
                zIndex: isSelected ? 20 : 2
              }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              onClick={() => handleEvidenceClick(item)}
              animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
              transition={isSelected ? { duration: 0.5, repeat: Infinity } : {}}
            >
              {/* Pin */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Pin 
                  className={`w-6 h-6 ${
                    item.pin === 'red' ? 'text-red-600' :
                    item.pin === 'blue' ? 'text-blue-600' :
                    item.pin === 'yellow' ? 'text-yellow-600' :
                    item.pin === 'green' ? 'text-green-600' :
                    'text-gray-800'
                  }`}
                  fill="currentColor"
                />
              </div>

              {/* Evidence card */}
              <div 
                className={`${item.color} p-2 sm:p-4 shadow-lg border-2 w-32 sm:w-40 md:w-48 relative transition-all ${
                  isSelected ? 'border-[#8b0000] border-4 ring-4 ring-[#8b0000]/50' : 'border-gray-300'
                }`}
                style={{
                  boxShadow: isSelected 
                    ? '0 0 20px rgba(139,0,0,0.8), 3px 3px 8px rgba(0,0,0,0.3)' 
                    : '3px 3px 8px rgba(0,0,0,0.3)',
                  fontFamily: 'Courier New, monospace'
                }}
              >
                {/* Lock indicator */}
                {item.locked && !isUnlocked && (
                  <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-[#8b0000] text-white p-0.5 sm:p-1 rounded-full min-w-[18px] sm:min-w-5 flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-bold">{item.layers - currentLayer}</span>
                  </div>
                )}

                {/* Viewed badge */}
                {isViewed && (
                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-green-600 text-white px-1 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold">
                    ✓ SEEN
                  </div>
                )}

                {/* Preview for photos */}
                {item.preview && (
                  <div className="w-full h-16 sm:h-20 md:h-24 bg-gray-200 mb-1 sm:mb-2 border border-gray-400 overflow-hidden">
                    <img 
                      src={`/api/protected?file=${encodeURIComponent(item.file)}`} 
                      className="w-full h-full object-cover opacity-80"
                      alt=""
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 text-xs">IMAGE</div>'
                      }}
                    />
                  </div>
                )}

                {/* Title */}
                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-center text-gray-900 line-clamp-2">
                  {item.title}
                </p>

                {/* Type indicator */}
                <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-center text-gray-600">
                  {item.type === 'diary' && '📔 DIARY'}
                  {item.type === 'photo' && '📷 PHOTO'}
                  {item.type === 'audio' && '🔊 AUDIO'}
                  {item.type === 'medical' && '⚕️ MEDICAL'}
                  {item.type === 'report' && '📋 REPORT'}
                  {item.type === 'document' && '📄 DOC'}
                  {item.type === 'newspaper' && '📰 NEWS'}
                </div>

                {/* Progress indicator */}
                {item.locked && currentLayer > 0 && !isUnlocked && (
                  <div className="mt-1 sm:mt-2">
                    <div className="h-0.5 sm:h-1 bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#8b0000]"
                        style={{ width: `${(currentLayer / item.layers) * 100}%` }}
                      />
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-center text-gray-600 mt-0.5 sm:mt-1">
                      {currentLayer}/{item.layers} LAYERS
                    </div>
                  </div>
                )}

                {/* Unlocked indicator */}
                {isUnlocked && (
                  <div className="mt-1 sm:mt-2 text-center text-green-700 font-bold text-[10px] sm:text-xs">
                    ✓ ACCESSED
                  </div>
                )}
              </div>

              {/* Hover effect */}
              <div className={`absolute inset-0 transition-colors pointer-events-none ${
                isSelected ? 'bg-red-500/30' : 'bg-yellow-200/0 group-hover:bg-yellow-200/20'
              }`} />
            </motion.div>
          )
        })}

        {/* Center mystery card */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 3 }}
        >
          <motion.div
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="bg-white p-6 shadow-2xl border-4 border-[#8b0000] w-64"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">❓</div>
              <p className="font-['Courier_New'] font-bold text-xl text-gray-900">
                WHAT REALLY<br/>HAPPENED?
              </p>
              <div className="mt-4 text-sm text-gray-600 italic">
                "They said the mountain<br/>took them.<br/>They were wrong."
              </div>
            </div>
          </motion.div>
        </div>
      </div> {/* Close Desktop Cork Board View */}
      </div>

      {/* Challenge Modal */}
      <AnimatePresence>
        {(selectedEvidence && currentChallenge && !viewingEvidence) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedEvidence(null)
              setCurrentChallenge(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#f5e6d3] border-4 sm:border-8 border-[#2a1f0f] p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
              style={{
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2), 0 20px 60px rgba(0,0,0,0.7)'
              }}
            >
              <button
                onClick={() => {
                  setSelectedEvidence(null)
                  setCurrentChallenge(null)
                }}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 text-2xl sm:text-3xl text-[#2a1f0f] hover:text-[#8b0000] z-10"
              >
                ×
              </button>

              {loadingChallenge ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-4">🔍</div>
                  <p className="font-['Courier_New'] text-sm sm:text-base text-[#2a1f0f]">
                    ANALYZING EVIDENCE...
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#2a1f0f] font-['Courier_New'] mb-2">
                      {selectedEvidence.title}
                    </h3>
                    <div className="h-1 bg-[#8b0000]" />
                  </div>

                  <div className="bg-white border-4 border-[#2a1f0f] p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 font-['Courier_New']">
                    <div 
                      className="text-[#2a1f0f] leading-relaxed text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ __html: currentChallenge.question }}
                    />
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <input
                      type="text"
                      value={challengeAnswer}
                      onChange={(e) => setChallengeAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && submitChallengeAnswer()}
                      placeholder="Your answer..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 border-[#2a1f0f] text-[#2a1f0f] font-['Courier_New'] focus:outline-none focus:border-[#8b0000]"
                      autoFocus
                    />
                  </div>

                  {challengeError && (
                    <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-[#8b0000] text-white font-['Courier_New'] text-xs sm:text-sm">
                      ⚠ {challengeError}
                    </div>
                  )}

                  {showHint && currentChallenge.hint && (
                    <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-yellow-100 border-2 border-yellow-600 text-yellow-900 font-['Courier_New'] text-xs sm:text-sm">
                      💡 HINT: {currentChallenge.hint}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                      onClick={submitChallengeAnswer}
                      className="flex-1 py-2 sm:py-3 text-sm sm:text-base bg-[#8b0000] text-white font-bold font-['Courier_New'] hover:bg-[#6b0000]"
                    >
                      SUBMIT
                    </button>
                    
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-yellow-600 text-white font-bold font-['Courier_New'] hover:bg-yellow-700"
                    >
                      {showHint ? 'HIDE' : 'HINT'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedEvidence(null)
                        setCurrentChallenge(null)
                        setShowHint(false)
                      }}
                      className="px-6 py-3 border-2 border-[#2a1f0f] text-[#2a1f0f] font-bold font-['Courier_New'] hover:bg-[#2a1f0f]/10"
                    >
                      CLOSE
                    </button>
                  </div>

                  {currentChallenge.layer && (
                    <div className="mt-6 text-center text-xs text-[#2a1f0f]/60 font-['Courier_New']">
                      SECURITY LAYER {currentChallenge.layer} OF {selectedEvidence.layers}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evidence Viewer Modal */}
      <AnimatePresence>
        {viewingEvidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (viewingEvidence.url) {
                URL.revokeObjectURL(viewingEvidence.url)
              }
              setViewingEvidence(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              <button
                onClick={() => {
                  if (viewingEvidence.url) {
                    URL.revokeObjectURL(viewingEvidence.url)
                  }
                  setViewingEvidence(null)
                }}
                className="absolute -top-12 right-0 text-white text-4xl hover:text-red-500 z-10"
              >
                ×
              </button>

              <div className="bg-[#f5e6d3] border-8 border-[#2a1f0f] p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-[#2a1f0f] font-['Courier_New'] mb-4 text-center">
                  {viewingEvidence.title}
                </h3>

                {viewingEvidence.type === 'image' && (
                  <div className="bg-black p-2">
                    <img 
                      src={viewingEvidence.url} 
                      alt={viewingEvidence.title}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>
                )}

                {viewingEvidence.type === 'audio' && (
                  <div className="bg-[#2a1f0f] p-8 rounded">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">🔊</div>
                      <p className="text-[#d4c5a9] font-['Courier_New'] text-sm mb-4">
                        AUDIO EVIDENCE - CLASSIFIED RECORDING
                      </p>
                    </div>
                    <audio 
                      controls 
                      autoPlay
                      className="w-full"
                      src={viewingEvidence.url}
                    >
                      Your browser does not support audio playback.
                    </audio>
                    <div className="mt-4 text-center text-xs text-[#d4c5a9]/60 font-['Courier_New']">
                      ⚠ AUDIO QUALITY DEGRADED DUE TO AGE AND CONDITIONS
                    </div>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      if (viewingEvidence.url) {
                        URL.revokeObjectURL(viewingEvidence.url)
                      }
                      setViewingEvidence(null)
                    }}
                    className="px-6 py-2 bg-[#8b0000] text-white font-bold font-['Courier_New'] hover:bg-[#6b0000]"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  )
}
