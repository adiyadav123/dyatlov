'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Send, Plus, MessageCircle, Menu, X, Archive } from 'lucide-react'
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
  const [ticketFilter, setTicketFilter] = useState('open') // 'open', 'archived', 'all'

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

    // Check notification support and permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
      // Show prompt if permission is default (not yet asked)
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

  // Helper function to properly sort messages by creation time
  const sortMessagesByTime = (messagesToSort) => {
    return [...messagesToSort].sort((a, b) => {
      try {
        // Parse both timestamps
        let timeA = a.created_at
        let timeB = b.created_at
        
        // Handle string timestamps
        if (typeof timeA === 'string') {
          // Normalize ISO format
          if (!timeA.endsWith('Z') && !timeA.includes('+')) {
            timeA = timeA + 'Z'
          }
        }
        if (typeof timeB === 'string') {
          // Normalize ISO format
          if (!timeB.endsWith('Z') && !timeB.includes('+')) {
            timeB = timeB + 'Z'
          }
        }
        
        const dateA = new Date(timeA).getTime()
        const dateB = new Date(timeB).getTime()
        
        // Handle invalid dates
        if (isNaN(dateA)) {
          console.warn('[Support] Invalid date A:', a.created_at)
          return 1
        }
        if (isNaN(dateB)) {
          console.warn('[Support] Invalid date B:', b.created_at)
          return -1
        }
        
        // Sort by timestamp (ascending = oldest first)
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
      
      // Log all fetched messages with timestamps
      console.log('[Support] Messages fetched from DB:', newMessages.map(m => ({
        id: m.id,
        sender: m.sender_type,
        created_at: m.created_at,
        message: m.message.substring(0, 40)
      })))
      
      // Sort using our helper function
      const sortedMessages = sortMessagesByTime(newMessages)
      
      // Debug log to verify sort order
      console.log('[Support] Messages after fetch and sort:', sortedMessages.map(m => ({
        id: m.id,
        sender: m.sender_type,
        created_at: m.created_at,
        message: m.message.substring(0, 40)
      })))
      
      setMessages(sortedMessages)

      const previousMessageCount = unreadTickets[ticketId] || 0
      const adminMessages = sortedMessages.filter((m) => m.sender_type === 'admin')
      if (adminMessages.length > previousMessageCount) {
        const newAdminMessages = adminMessages.slice(previousMessageCount)
        newAdminMessages.forEach((msg) => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Support Response', {
              body: msg.message,
              icon: '/api/protected?file=cia.png',
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
      console.log('[Support] Sending message with client timestamp:', clientTimestamp)

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

      // Log the returned data to see if timestamp changed
      console.log('[Support] Message returned from DB:', {
        id: data[0].id,
        created_at: data[0].created_at,
        client_created_at: clientTimestamp,
        timestamp_changed: data[0].created_at !== clientTimestamp
      })

      // Add new message and re-sort using our helper function
      const updatedMessages = sortMessagesByTime([...messages, data[0]])
      
      console.log('[Support] Message sent, new order:', updatedMessages.map(m => ({
        id: m.id,
        sender: m.sender_type,
        created_at: m.created_at,
        message: m.message.substring(0, 40)
      })))
      
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
            icon: '/api/protected?file=cia.png',
            badge: '/api/protected?file=cia.png'
          })
          setShowNotificationPrompt(false)
        }
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading support...</div>
      </div>
    )
  }

  // Filter tickets based on selected filter
  const filteredTickets = tickets.filter(ticket => {
    if (ticketFilter === 'open') return !ticket.resolved
    if (ticketFilter === 'archived') return ticket.resolved
    return true // 'all'
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-[#1a1a1b]/95 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h1 className="text-base sm:text-lg font-bold">Support Center</h1>
          </div>
          <button
            onClick={() => router.push('/start')}
            className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 sm:py-6 flex flex-col min-h-0">
        {/* Notification Permission Prompt */}
        {showNotificationPrompt && notificationPermission === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-3 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between gap-3 sm:gap-4 shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="text-xl sm:text-2xl shrink-0">🔔</div>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm">Enable Notifications</p>
                <p className="text-xs text-neutral-400">Get notified when admins respond</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleRequestNotificationPermission}
                className="px-2 sm:px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
              >
                Enable
              </button>
              <button
                onClick={() => setShowNotificationPrompt(false)}
                className="px-2 sm:px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded transition-colors"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex-1 flex gap-4 lg:gap-6 relative min-h-0">
          
          <AnimatePresence>
            {(showSidebar || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="fixed lg:static inset-y-0 top-[65px] sm:top-[73px] left-0 z-40 lg:z-0 w-72 lg:w-80 shrink-0 lg:shrink-0 h-[calc(100vh-65px)] sm:h-[calc(100vh-73px)] lg:h-full"
              >
                <div className="h-full flex flex-col bg-[#1a1a1b] border border-white/10 rounded-none lg:rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between lg:justify-center shrink-0">
                    <Button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="flex-1 lg:w-full h-10 glass-button font-medium text-sm flex items-center justify-center gap-2 ticket_button"
                    >
                      <Plus className="w-4 h-4" />
                      New Ticket
                    </Button>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="lg:hidden ml-2 p-2 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-5 h-5 ticket_cross" />
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="px-2 pb-2 border-b border-white/10">
                    <div className="bg-[#0f0f10] rounded-lg flex overflow-hidden">
                      {[
                        { id: 'open', label: 'Open', icon: Ticket },
                        { id: 'archived', label: 'Archived', icon: Archive }
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setTicketFilter(filter.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                            ticketFilter === filter.id
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'text-neutral-400 hover:bg-white/5'
                          }`}
                        >
                          <filter.icon className="w-3.5 h-3.5" />
                          <span>{filter.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 p-2 overflow-y-auto flex-1 min-h-0">
                    {filteredTickets.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500 text-sm">
                        <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>No {ticketFilter} tickets</p>
                      </div>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket)}
                          className={`w-full text-left p-3 rounded-lg transition-all text-sm ${
                            selectedTicket?.id === ticket.id
                              ? 'bg-blue-500/20 border border-blue-500/30'
                              : 'bg-white/5 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <div className="font-medium text-sm line-clamp-1">{ticket.title}</div>
                          <div className="text-xs text-neutral-500 mt-1">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {ticket.resolved ? (
                              <div className="text-xs text-green-400 flex items-center gap-1">
                                <Archive className="w-3 h-3" />
                                Archived
                              </div>
                            ) : (
                              <div className="text-xs text-yellow-400">● Open</div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showSidebar && (
            <div
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
          )}

          <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1a1a1b] border border-white/10 rounded-lg p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-bold mb-4">Create New Ticket</h3>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  {createTicketError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
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
                      className="glass-input h-11 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-300 text-sm font-medium">Description</Label>
                    <textarea
                      placeholder="Describe your issue in detail..."
                      value={newTicketDescription}
                      onChange={(e) => setNewTicketDescription(e.target.value)}
                      required
                      rows="4"
                      className="glass-input p-3 text-sm sm:text-base w-full resize-y min-h-[100px]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="submit"
                      className="flex-1 h-10 glass-button font-medium text-sm"
                    >
                      Create Ticket
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {selectedTicket ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1a1a1b] border border-white/10 rounded-lg flex flex-col flex-1 min-w-0 min-h-[600px]"
              >
                <div className="shrink-0 p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-blue-950/20 to-transparent">
                  <h2 className="text-base sm:text-xl font-bold line-clamp-2">{selectedTicket.title}</h2>
                  <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-neutral-400 flex-wrap">
                    <span>{new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                    <span className={selectedTicket.resolved ? 'text-green-400' : 'text-yellow-400'}>
                      {selectedTicket.resolved ? '✓ Resolved' : '● Open'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="h-[500px] overflow-y-auto p-4 sm:p-6 space-y-3 support-scroll">
                    {/* Initial Issue */}
                    <div className="flex justify-start mb-4">
                      <div className="bg-amber-600 text-white px-4 py-2 rounded-2xl rounded-tl-none text-sm max-w-[85%] sm:max-w-[75%] shadow-lg">
                        <p className="text-xs font-semibold mb-1">📋 Initial Issue</p>
                        <p className="break-words whitespace-pre-wrap">{selectedTicket.description}</p>
                      </div>
                    </div>

                    {/* Messages */}
                    {messages.map((msg, idx) => {
                    const isAdmin = msg.sender_type === 'admin'
                    
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
                          second: '2-digit',
                          hour12: true
                        })
                      } catch (err) {
                        console.error('Error formatting time:', err)
                        return 'Time error'
                      }
                    }

                    return (
                      <div key={`${msg.id}-${idx}`} className={`flex w-full ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`flex flex-col max-w-[95%] gap-1 min-w-0`}>
                          {/* Sender name */}
                          <div className={`text-xs font-semibold px-1 ${isAdmin ? 'text-blue-400 text-left' : 'text-gray-400 text-right'}`}>
                            {isAdmin ? '👤 Admin' : '👤 You'}
                          </div>
                          
                          {/* Message bubble */}
                          <div
                            className={`px-4 py-2 rounded-2xl text-sm font-medium break-words ${
                              isAdmin
                                ? 'bg-blue-500 text-white rounded-tl-none shadow-lg'
                                : 'bg-green-500 text-white rounded-tr-none shadow-lg'
                            }`}
                          >
                            {msg.message}
                          </div>
                          
                          {/* Timestamp */}
                          <div className={`text-xs text-neutral-500 px-1 ${isAdmin ? 'text-left' : 'text-right'}`}>
                            {formatMessageTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="shrink-0 border-t border-white/10 p-4 sm:p-6 space-y-3">
                  <textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                    disabled={selectedTicket.resolved}
                    rows="2"
                    className="w-full glass-input p-3 text-sm resize-y min-h-[60px] max-h-[150px]"
                  />
                  <Button
                    type="submit"
                    disabled={sendingMessage || selectedTicket.resolved}
                    className="w-full sm:w-auto h-10 glass-button flex items-center justify-center gap-2 text-sm px-6"
                  >
                    <Send className="w-4 h-4" />
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </Button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-neutral-500 text-sm sm:text-base">Select or create a ticket to start chatting</p>
              </div>
            )}
          </div>
        </div>
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

        /* Scrolling helpers for mobile chat */
        .support-scroll {
          -webkit-overflow-scrolling: touch; /* momentum scrolling on iOS */
          touch-action: pan-y; /* allow vertical pan */
          overscroll-behavior: contain; /* keep scroll inside chat */
        }
      `}</style>
    </div>
  )
}
