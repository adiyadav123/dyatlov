'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Send, Plus, MessageCircle, Menu, X, ArrowLeft, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SupportPage() {
  const router = useRouter()
  const messagesEndRef = useRef(null)
  const [participantType, setParticipantType] = useState(null)
  const [participantId, setParticipantId] = useState(null)
  const [teamId, setTeamId] = useState(null)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [newTicketTitle, setNewTicketTitle] = useState('')
  const [newTicketDescription, setNewTicketDescription] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [unreadTickets, setUnreadTickets] = useState({})
  const [createTicketError, setCreateTicketError] = useState('')
  const [messageError, setMessageError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [notificationPermission, setNotificationPermission] = useState(null)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  useEffect(() => {
    const pType = localStorage.getItem('participantType')
    const pId = localStorage.getItem('participantId')
    const tId = localStorage.getItem('teamId')

    if (!pType) {
      router.push('/register')
      return
    }

    setParticipantType(pType)
    setParticipantId(pId)
    setTeamId(tId)

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
      if (Notification.permission === 'default') {
        setShowNotificationPrompt(true)
      }
    }

    fetchTickets(pType, pId, tId)

    const ticketInterval = setInterval(() => {
      fetchTickets(pType, pId, tId)
    }, 15000)

    return () => clearInterval(ticketInterval)
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchTickets = async (type, pId, tId) => {
    try {
      setFetchError('')
      const id = type === 'team' ? tId : pId
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq(type === 'team' ? 'team_id' : 'participant_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTickets(data || [])
    } catch (err) {
      console.log('Error fetching tickets:', err)
      setFetchError('Failed to load tickets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sortMessagesByTime = (messagesToSort) => {
    return [...messagesToSort].sort((a, b) => {
      try {
        let timeA = a.created_at
        let timeB = b.created_at
        
        if (typeof timeA === 'string') {
          if (!timeA.endsWith('Z') && !timeA.includes('+')) {
            timeA = timeA + 'Z'
          }
        }
        if (typeof timeB === 'string') {
          if (!timeB.endsWith('Z') && !timeB.includes('+')) {
            timeB = timeB + 'Z'
          }
        }
        
        const dateA = new Date(timeA).getTime()
        const dateB = new Date(timeB).getTime()
        
        if (isNaN(dateA)) {
          console.warn('[Support] Invalid date A:', a.created_at)
          return 1
        }
        if (isNaN(dateB)) {
          console.warn('[Support] Invalid date B:', b.created_at)
          return -1
        }
        
        return dateA - dateB
      } catch (err) {
        console.error('[Support] Error sorting messages:', err, { a, b })
        return 0
      }
    })
  }

  const fetchMessages = async (ticketId) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const newMessages = data || []
      const sortedMessages = sortMessagesByTime(newMessages)
      
      setMessages(sortedMessages)

      const previousMessageCount = unreadTickets[ticketId] || 0
      const adminMessages = sortedMessages.filter((m) => m.sender_type === 'admin')
      if (adminMessages.length > previousMessageCount) {
        const newAdminMessages = adminMessages.slice(previousMessageCount)
        newAdminMessages.forEach((msg) => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Support Response', {
              body: msg.message,
              icon: '/cia.png',
              tag: `ticket-${ticketId}`,
              requireInteraction: false,
            })
          }
        })
        setUnreadTickets({
          ...unreadTickets,
          [ticketId]: adminMessages.length,
        })
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  useEffect(() => {
    if (selectedTicket?.id) {
      fetchMessages(selectedTicket.id)
      const messageInterval = setInterval(() => {
        fetchMessages(selectedTicket.id)
      }, 8000)
      return () => clearInterval(messageInterval)
    }
  }, [selectedTicket?.id])

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    setCreateTicketError('')

    try {
      if (!newTicketTitle.trim() || !newTicketDescription.trim()) {
        throw new Error('Title and description are required')
      }

      const response = await fetch('/api/support/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTicketTitle,
          description: newTicketDescription,
          participantType,
          participantId,
          teamId,
          participantName: localStorage.getItem('participantName'),
          teamName: localStorage.getItem('teamName')
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create ticket: ${response.status}`)
      }

      const result = await response.json()
      setTickets([result.ticket, ...tickets])
      setNewTicketTitle('')
      setNewTicketDescription('')
      setShowCreateForm(false)
    } catch (err) {
      console.error('Error creating ticket:', err)
      setCreateTicketError(err.message || 'Failed to create ticket. Please try again.')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    setSendingMessage(true)
    setMessageError('')

    try {
      if (!newMessage.trim()) {
        throw new Error('Message cannot be empty')
      }

      const clientTimestamp = new Date().toISOString()

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([
          {
            ticket_id: selectedTicket.id,
            sender_type: participantType,
            message: newMessage,
            created_at: clientTimestamp
          }
        ])
        .select()

      if (error) throw error

      const updatedMessages = sortMessagesByTime([...messages, data[0]])
      setMessages(updatedMessages)
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      setMessageError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    fetchMessages(ticket.id)
    setShowSidebar(false)
  }

  const handleRequestNotificationPermission = async () => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        
        if (permission === 'granted') {
          new Notification('Notifications Enabled! 🔔', {
            body: 'You will now receive notifications for admin responses',
            icon: '/cia.png',
            badge: '/cia.png'
          })
          setShowNotificationPrompt(false)
        }
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err)
    }
  }

  const formatMessageTime = (dateString) => {
    try {
      let normalizedDate = dateString
      if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
        normalizedDate = dateString + 'Z'
      }
      const date = new Date(normalizedDate)
      if (isNaN(date.getTime())) {
        return 'Invalid time'
      }
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    } catch (err) {
      console.error('Error formatting time:', err)
      return 'Time error'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-sm sm:text-base">Loading support...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#1a1a1b]/95 backdrop-blur-md border-b border-white/10 shrink-0 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile: Show menu or back button */}
            {selectedTicket ? (
              <button
                onClick={() => setSelectedTicket(null)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h1 className="text-base sm:text-lg font-bold">Support Center</h1>
          </div>
          <button
            onClick={() => router.push('/start')}
            className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors px-3 py-1.5"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 bg-[#1a1a1b] border-r border-white/10 shrink-0">
          <div className="h-full flex flex-col">
            {/* New Ticket Button */}
            <div className="p-4 border-b border-white/10">
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full h-11 glass-button font-medium text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Ticket
              </Button>
            </div>

            {/* Tickets List */}
            <div className="flex-1 overflow-y-auto p-3">
              {tickets.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No tickets yet</p>
                  <p className="text-xs mt-1">Create one to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1 line-clamp-1">{ticket.title}</div>
                      <div className="text-xs text-neutral-400 mb-2">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      {!ticket.resolved && (
                        <span className="inline-block px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                          Open
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSidebar(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'tween', duration: 0.2 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-[#1a1a1b] border-r border-white/10 z-50 lg:hidden"
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-bold">Your Tickets</h2>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 border-b border-white/10">
                    <Button
                      onClick={() => {
                        setShowCreateForm(true)
                        setShowSidebar(false)
                      }}
                      className="w-full h-11 glass-button font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Ticket
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3">
                    {tickets.length === 0 ? (
                      <div className="text-center py-12 text-neutral-500">
                        <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No tickets yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tickets.map((ticket) => (
                          <button
                            key={ticket.id}
                            onClick={() => handleSelectTicket(ticket)}
                            className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                          >
                            <div className="font-semibold text-sm mb-1 line-clamp-1">{ticket.title}</div>
                            <div className="text-xs text-neutral-400 mb-2">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </div>
                            {!ticket.resolved && (
                              <span className="inline-block px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                Open
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
              {/* Notification Prompt */}
              {showNotificationPrompt && notificationPermission === 'default' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Bell className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">Enable Notifications</p>
                      <p className="text-xs text-neutral-400">Get notified when admins respond</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleRequestNotificationPermission}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Enable
                    </button>
                    <button
                      onClick={() => setShowNotificationPrompt(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Create Ticket Form */}
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1a1a1b] border border-white/10 rounded-xl p-4 sm:p-6"
                >
                  <h3 className="text-lg sm:text-xl font-bold mb-5">Create New Ticket</h3>
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    {createTicketError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-300 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                      >
                        ✕ {createTicketError}
                      </motion.div>
                    )}
                    
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Subject</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Issue with clue finding"
                        value={newTicketTitle}
                        onChange={(e) => setNewTicketTitle(e.target.value)}
                        required
                        className="glass-input h-11 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Description</Label>
                      <textarea
                        placeholder="Describe your issue in detail..."
                        value={newTicketDescription}
                        onChange={(e) => setNewTicketDescription(e.target.value)}
                        required
                        rows="6"
                        className="glass-input p-3 text-base w-full resize-y min-h-[150px]"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="submit"
                        className="flex-1 h-11 glass-button font-medium"
                      >
                        Create Ticket
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1 h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Ticket View */}
              {selectedTicket ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#1a1a1b] border border-white/10 rounded-xl overflow-hidden flex flex-col"
                  style={{ height: showCreateForm ? 'calc(100vh - 600px)' : 'calc(100vh - 200px)', minHeight: '500px' }}
                >
                  {/* Ticket Header */}
                  <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-blue-950/20 to-transparent">
                    <h2 className="text-lg sm:text-xl font-bold mb-2">{selectedTicket.title}</h2>
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-400">
                      <span>{new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                      <span className={selectedTicket.resolved ? 'text-green-400' : 'text-yellow-400'}>
                        {selectedTicket.resolved ? '✓ Resolved' : '● Open'}
                      </span>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {/* Initial Issue */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] sm:max-w-[75%]">
                        <div className="text-xs font-semibold text-amber-400 mb-1 px-1">📋 Initial Issue</div>
                        <div className="bg-amber-600 text-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg">
                          <p className="text-sm break-words whitespace-pre-wrap">{selectedTicket.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    {messages.map((msg, idx) => {
                      const isAdmin = msg.sender_type === 'admin'
                      
                      return (
                        <div key={`${msg.id}-${idx}`} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-1 ${isAdmin ? 'items-start' : 'items-end'}`}>
                            <span className={`text-xs font-semibold px-1 ${isAdmin ? 'text-blue-400' : 'text-green-400'}`}>
                              {isAdmin ? '👤 Admin' : '👤 You'}
                            </span>
                            <div
                              className={`px-4 py-3 rounded-2xl text-sm shadow-lg ${
                                isAdmin
                                  ? 'bg-blue-500 text-white rounded-tl-sm'
                                  : 'bg-green-500 text-white rounded-tr-sm'
                              }`}
                            >
                              {msg.message}
                            </div>
                            <span className="text-xs text-neutral-500 px-1">
                              {formatMessageTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4 sm:p-6 space-y-3">
                    {messageError && (
                      <div className="text-red-300 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        ✕ {messageError}
                      </div>
                    )}
                    <textarea
                      placeholder={selectedTicket.resolved ? "This ticket is resolved" : "Type your message..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      required
                      disabled={selectedTicket.resolved}
                      rows="3"
                      className="w-full glass-input p-3 text-sm resize-none"
                    />
                    <Button
                      type="submit"
                      disabled={sendingMessage || selectedTicket.resolved}
                      className="w-full sm:w-auto h-11 glass-button flex items-center justify-center gap-2 px-6"
                    >
                      <Send className="w-4 h-4" />
                      {sendingMessage ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <div className="bg-[#1a1a1b] border border-white/10 rounded-xl p-12 text-center min-h-[500px] flex flex-col items-center justify-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-neutral-500 text-base mb-2">No ticket selected</p>
                  <p className="text-neutral-600 text-sm">Select a ticket from the sidebar or create a new one</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .glass-input {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
          font-family: inherit;
          border-radius: 0.5rem;
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
