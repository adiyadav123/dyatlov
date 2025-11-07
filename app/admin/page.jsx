'use client'

import { useState, useEffect } from 'react'
import { Lock, Send, Ticket, Bell, LogOut, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  const ADMIN_EMAIL = 'jaipuriacomputerclub@gmail.com'
  const ADMIN_PASSWORD = 'admin@site'

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
    } else {
      setLoginError('Invalid email or password')
    }

    setLoading(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuth')
    setEmail('')
    setPassword('')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-stone-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#1a1a1b] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-red-400 mr-3" />
                <h1 className="text-xl sm:text-2xl font-bold">Admin Access</h1>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label className="text-neutral-300 text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input h-11 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-300 text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="glass-input h-11 text-base pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-300 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                  >
                    {loginError}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 glass-button font-medium"
                >
                  {loading ? 'Authenticating...' : 'Access Dashboard'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-neutral-500">
                <p>Authorized personnel only</p>
                <p className="mt-1">All access is logged and monitored</p>
              </div>
            </div>
          </motion.div>
        </div>

        <style jsx global>{`
          .glass-input {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            transition: all 0.3s ease;
          }

          .glass-input::placeholder {
            color: rgba(163, 163, 163, 0.6);
          }

          .glass-input:focus {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
          }

          .glass-button {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            transition: all 0.3s ease;
          }

          .glass-button:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
          }

          .glass-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('notifications')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [sendingNotification, setSendingNotification] = useState(false)
  const [notificationSuccess, setNotificationSuccess] = useState('')
  const [notificationError, setNotificationError] = useState('')
  const [enhancingNotification, setEnhancingNotification] = useState(false)
  const [enhancingReply, setEnhancingReply] = useState(false)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketMessages, setTicketMessages] = useState([])
  const [replyMessage, setReplyMessage] = useState('')
  const [replyError, setReplyError] = useState('')
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [showTicketsList, setShowTicketsList] = useState(true)

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets()
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketMessages(selectedTicket.id)
      const messageInterval = setInterval(() => {
        fetchTicketMessages(selectedTicket.id)
      }, 3000)
      return () => clearInterval(messageInterval)
    }
  }, [selectedTicket])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/tickets')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error('Error fetching tickets:', err)
    } finally {
      setLoadingTickets(false)
    }
  }

  const fetchTicketMessages = async (ticketId) => {
    try {
      const response = await fetch(`/api/admin/tickets/messages?ticketId=${ticketId}`)
      const data = await response.json()
      const messages = Array.isArray(data) ? data : []
      setTicketMessages(sortMessagesByTime(messages))
    } catch (err) {
      console.error('Error fetching messages:', err)
      setTicketMessages([])
    }
  }

  const sortMessagesByTime = (msgs) => {
    return [...msgs].sort((a, b) => {
      try {
        let timeA = a.created_at
        let timeB = b.created_at
        if (typeof timeA === 'string' && !timeA.endsWith('Z') && !timeA.includes('+')) timeA += 'Z'
        if (typeof timeB === 'string' && !timeB.endsWith('Z') && !timeB.includes('+')) timeB += 'Z'
        const dateA = new Date(timeA).getTime()
        const dateB = new Date(timeB).getTime()
        if (isNaN(dateA)) return 1
        if (isNaN(dateB)) return -1
        return dateA - dateB
      } catch {
        return 0
      }
    })
  }

  const formatTime = (dateString) => {
    try {
      let normalized = dateString
      if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
        normalized += 'Z'
      }
      const date = new Date(normalized)
      if (isNaN(date.getTime())) return 'Invalid'
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return 'Error'
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    setSendingNotification(true)
    setNotificationError('')
    setNotificationSuccess('')

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notificationTitle, message: notificationMessage })
      })

      if (!response.ok) throw new Error('Failed to send')
      setNotificationSuccess('Notification sent!')
      setNotificationTitle('')
      setNotificationMessage('')
      setTimeout(() => setNotificationSuccess(''), 3000)
    } catch (err) {
      setNotificationError('Failed to send notification')
    } finally {
      setSendingNotification(false)
    }
  }

  const handleReplyToTicket = async (e) => {
    e.preventDefault()
    setReplyError('')

    try {
      const response = await fetch('/api/admin/tickets/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket.id, message: replyMessage })
      })

      if (!response.ok) throw new Error('Failed')
      setReplyMessage('')
      fetchTickets()
      if (selectedTicket?.id) fetchTicketMessages(selectedTicket.id)
    } catch (err) {
      setReplyError('Failed to send reply')
    }
  }

  const handleEnhanceNotification = async () => {
    if (!notificationMessage.trim()) return
    
    setEnhancingNotification(true)
    setNotificationError('')
    
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notificationMessage })
      })

      if (!response.ok) throw new Error('Failed to enhance')
      
      const data = await response.json()
      if (data.enhanced) {
        setNotificationMessage(data.enhanced)
      } else {
        throw new Error('No enhanced text received')
      }
    } catch (err) {
      setNotificationError('Failed to enhance message. Please try again.')
      setTimeout(() => setNotificationError(''), 3000)
    } finally {
      setEnhancingNotification(false)
    }
  }

  const handleEnhanceReply = async () => {
    if (!replyMessage.trim()) return
    
    setEnhancingReply(true)
    setReplyError('')
    
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyMessage })
      })

      if (!response.ok) throw new Error('Failed to enhance')
      
      const data = await response.json()
      if (data.enhanced) {
        setReplyMessage(data.enhanced)
      } else {
        throw new Error('No enhanced text received')
      }
    } catch (err) {
      setReplyError('Failed to enhance message. Please try again.')
      setTimeout(() => setReplyError(''), 3000)
    } finally {
      setEnhancingReply(false)
    }
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#1a1a1b]/95 backdrop-blur-md border-b border-white/10 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-400" />
            <h1 className="text-base sm:text-lg font-bold">Admin Dashboard</h1>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      {activeTab === 'notifications' ? (
        <div className="flex-1 overflow-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto h-full">
            {/* Sidebar */}
            <div className="w-full lg:w-56 shrink-0">
              <div className="bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden">
                {[
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'tickets', label: 'Support Tickets', icon: Ticket }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setShowTicketsList(true)
                      setSelectedTicket(null)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-white/5 last:border-0 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-300 border-l-2 border-l-blue-500'
                        : 'text-neutral-400 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Form */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1a1a1b] border border-white/10 rounded-lg p-6"
              >
                <h2 className="text-xl font-bold mb-6">Send Notification to All</h2>
                <form onSubmit={handleSendNotification} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Title</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Important Update"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      required
                      className="glass-input h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Message</Label>
                      <button
                        type="button"
                        onClick={handleEnhanceNotification}
                        disabled={enhancingNotification || !notificationMessage.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {enhancingNotification ? 'Enhancing...' : 'Enhance Message'}
                      </button>
                    </div>
                    <textarea
                      placeholder="Enter notification message..."
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      required
                      rows="6"
                      className="glass-input p-3 text-sm w-full resize-y rounded-lg"
                    />
                  </div>

                  {notificationError && (
                    <div className="text-red-300 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      ✕ {notificationError}
                    </div>
                  )}

                  {notificationSuccess && (
                    <div className="text-green-300 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      ✓ {notificationSuccess}
                    </div>
                  )}

                  <Button type="submit" disabled={sendingNotification} className="w-full h-11 glass-button font-medium flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    {sendingNotification ? 'Sending...' : 'Send Notification'}
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        // TICKETS VIEW
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Tab Navigation - Mobile Only */}
          <div className="lg:hidden px-4 py-3 flex-shrink-0">
            <div className="bg-[#1a1a1b] border border-white/10 rounded-lg flex overflow-hidden">
              {[
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'tickets', label: 'Support Tickets', icon: Ticket }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setShowTicketsList(true)
                    setSelectedTicket(null)
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-blue-500/20 text-blue-300' : 'text-neutral-400 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 px-4 mb-3 flex-shrink-0">
            <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{tickets.length}</div>
              <div className="text-xs text-neutral-500 mt-1">Total</div>
            </div>
            <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{tickets.filter(t => !t.resolved).length}</div>
              <div className="text-xs text-neutral-500 mt-1">Open</div>
            </div>
            <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{tickets.filter(t => t.resolved).length}</div>
              <div className="text-xs text-neutral-500 mt-1">Resolved</div>
            </div>
          </div>

          {/* Tickets Layout */}
          <div className="flex-1 px-4 pb-4 min-h-0 overflow-hidden">
            {/* Mobile */}
            <div className="lg:hidden h-full">
              {showTicketsList ? (
                <div className="bg-[#1a1a1b] border border-white/10 rounded-lg flex flex-col h-full overflow-hidden">
                  <h3 className="text-lg font-bold p-4 border-b border-white/10 flex-shrink-0">Tickets</h3>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loadingTickets ? (
                      <div className="text-center text-neutral-500 py-8">Loading...</div>
                    ) : tickets.length === 0 ? (
                      <div className="text-center text-neutral-500 py-8">No tickets</div>
                    ) : (
                      tickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setShowTicketsList(false)
                          }}
                          className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        >
                          <div className="font-medium text-sm truncate">{ticket.title}</div>
                          <div className="text-xs text-neutral-400 mt-1">{ticket.type === 'team' ? ticket.team_name : ticket.participant_name}</div>
                          {!ticket.resolved && <div className="text-xs text-yellow-400 mt-1">● Open</div>}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                selectedTicket && (
                  <div className="bg-[#1a1a1b] border border-white/10 rounded-lg flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setShowTicketsList(true)} className="text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold truncate">{selectedTicket.title}</h3>
                        <p className="text-xs text-neutral-500 truncate">
                          {selectedTicket.type === 'team' ? selectedTicket.team_name : selectedTicket.participant_name}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="px-3 py-2 border-b border-white/10 flex-shrink-0">
                      <div className="text-xs text-neutral-500 mb-1 uppercase font-medium">Original Message</div>
                      <div className="bg-white/5 p-2 rounded text-xs max-h-20 overflow-y-auto">{selectedTicket.description}</div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto bg-[#0f0f10] p-3 min-h-0">
                      {ticketMessages.length === 0 ? (
                        <div className="text-center text-neutral-500 text-xs py-8">No messages yet</div>
                      ) : (
                        <div className="space-y-3">
                          {ticketMessages.map((msg, idx) => {
                            const isAdmin = msg.sender_type === 'admin'
                            return (
                              <div key={`${msg.id}-${idx}`} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%]`}>
                                  <div className={`text-[10px] font-semibold px-1 mb-0.5 ${isAdmin ? 'text-blue-400' : 'text-gray-400 text-right'}`}>
                                    {isAdmin ? 'Admin' : 'User'}
                                  </div>
                                  <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                                    isAdmin ? 'bg-blue-500 text-white rounded-tl-none' : 'bg-green-500 text-white rounded-tr-none'
                                  }`}>
                                    {msg.message}
                                  </div>
                                  <div className={`text-[9px] text-neutral-500 px-1 mt-0.5 ${isAdmin ? '' : 'text-right'}`}>
                                    {formatTime(msg.created_at)}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Reply */}
                    <form onSubmit={handleReplyToTicket} className="border-t border-white/10 p-3 flex-shrink-0">
                      {replyError && <div className="text-red-300 text-xs bg-red-500/10 p-2 rounded mb-2 border border-red-500/20">{replyError}</div>}
                      <textarea
                        placeholder="Type reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        required
                        rows="3"
                        className="glass-input p-2 text-xs w-full resize-none mb-2 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleEnhanceReply}
                          disabled={enhancingReply || !replyMessage.trim()}
                          className="flex items-center justify-center gap-1 px-3 h-9 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          {enhancingReply ? 'Enhancing...' : 'Enhance'}
                        </button>
                        <Button type="submit" className="flex-1 h-9 glass-button text-xs flex items-center justify-center gap-1.5">
                          <Send className="w-3.5 h-3.5" />
                          Send Reply
                        </Button>
                      </div>
                    </form>
                  </div>
                )
              )}
            </div>

            {/* Desktop - Fixed Height Grid */}
            <div className="hidden lg:flex gap-4 h-full min-h-0">
              {/* Sidebar */}
              <div className="w-56 shrink-0 bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden">
                <div className="bg-[#1a1a1b] border-b border-white/10 p-4">
                  <div className="space-y-2">
                    {[
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'tickets', label: 'Support Tickets', icon: Ticket }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setShowTicketsList(true)
                          setSelectedTicket(null)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'text-neutral-400 hover:bg-white/5'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              <div className="w-80 shrink-0 bg-[#1a1a1b] border border-white/10 rounded-lg flex flex-col overflow-hidden min-h-0">
                <h3 className="text-lg font-bold p-4 border-b border-white/10 flex-shrink-0">Tickets</h3>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                  {loadingTickets ? (
                    <div className="text-center text-neutral-500 py-8">Loading...</div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center text-neutral-500 py-8">No tickets</div>
                  ) : (
                    tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-blue-500/20 border-2 border-blue-500/50'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <div className="font-medium truncate">{ticket.title}</div>
                        <div className="text-xs text-neutral-400 mt-1 truncate">{ticket.type === 'team' ? ticket.team_name : ticket.participant_name}</div>
                        {!ticket.resolved && <div className="text-xs text-yellow-400 mt-1">● Open</div>}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Ticket Detail */}
              {selectedTicket ? (
                <div className="flex-1 bg-[#1a1a1b] border border-white/10 rounded-lg flex flex-col overflow-hidden min-h-0">
                  {/* Header */}
                  <div className="p-4 border-b border-white/10 flex-shrink-0">
                    <h3 className="text-lg font-bold truncate">{selectedTicket.title}</h3>
                    <p className="text-sm text-neutral-400 truncate">{selectedTicket.type === 'team' ? selectedTicket.team_name : selectedTicket.participant_name}</p>
                  </div>

                  {/* Description */}
                  <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
                    <div className="text-xs text-neutral-500 mb-2 uppercase font-medium">Original Message</div>
                    <div className="bg-white/5 p-3 rounded-lg text-sm max-h-24 overflow-y-auto">{selectedTicket.description}</div>
                  </div>

                  {/* Messages - Takes remaining space */}
                  <div className="flex-1 overflow-y-auto bg-[#0f0f10] p-4 min-h-0">
                    {ticketMessages.length === 0 ? (
                      <div className="text-center text-neutral-500 py-12">No messages yet</div>
                    ) : (
                      <div className="space-y-4">
                        {ticketMessages.map((msg, idx) => {
                          const isAdmin = msg.sender_type === 'admin'
                          return (
                            <div key={`${msg.id}-${idx}`} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                              <div className="max-w-[70%]">
                                <div className={`text-xs font-semibold px-1 mb-1 ${isAdmin ? 'text-blue-400' : 'text-gray-400 text-right'}`}>
                                  {isAdmin ? 'Admin' : 'User'}
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isAdmin ? 'bg-blue-500 text-white rounded-tl-none' : 'bg-green-500 text-white rounded-tr-none'
                                }`}>
                                  {msg.message}
                                </div>
                                <div className={`text-xs text-neutral-500 px-1 mt-1 ${isAdmin ? '' : 'text-right'}`}>
                                  {formatTime(msg.created_at)}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleReplyToTicket} className="border-t border-white/10 p-4 flex-shrink-0">
                    {replyError && <div className="text-red-300 text-xs bg-red-500/10 p-2 rounded mb-3 border border-red-500/20">{replyError}</div>}
                    <Label className="text-xs font-medium uppercase mb-2 block text-neutral-400">Your Reply</Label>
                    <textarea
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      required
                      rows="3"
                      className="glass-input p-3 text-sm w-full resize-none mb-3 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleEnhanceReply}
                        disabled={enhancingReply || !replyMessage.trim()}
                        className="flex items-center justify-center gap-1.5 px-4 h-10 text-sm font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        {enhancingReply ? 'Enhancing...' : 'Enhance'}
                      </button>
                      <Button type="submit" className="flex-1 h-10 glass-button text-sm flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Reply
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 bg-[#1a1a1b] border border-white/10 rounded-lg flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a ticket to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-input {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .glass-input::placeholder {
          color: rgba(163, 163, 163, 0.6);
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
          outline: none;
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          transition: all 0.3s ease;
        }

        .glass-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .glass-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}