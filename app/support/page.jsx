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
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState([])

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
      
      // Calculate unread counts using the database
      const unreadCounts = {}
      for (const ticket of (data || [])) {
        // Get the last read timestamp for this ticket from database
        const { data: readData } = await supabase
          .from('ticket_reads')
          .select('last_read_at')
          .eq('ticket_id', ticket.id)
          .eq(type === 'team' ? 'team_id' : 'participant_id', id)
          .eq('participant_type', type)
          .maybeSingle()
        
        const lastReadAt = readData?.last_read_at
        
        // Get unread admin messages count
        let query = supabase
          .from('ticket_messages')
          .select('id', { count: 'exact', head: false })
          .eq('ticket_id', ticket.id)
          .eq('sender_type', 'admin')
        
        if (lastReadAt) {
          query = query.gt('created_at', lastReadAt)
        }
        
        const { data: unreadMessages, count } = await query
        
        if (count > 0) {
          unreadCounts[ticket.id] = count
        }
      }
      
      setUnreadTickets(unreadCounts)
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
      setMessagesLoading(true)
      
      // Get last read timestamp from database
      const id = participantType === 'team' ? teamId : participantId
      const { data: readData } = await supabase
        .from('ticket_reads')
        .select('last_read_at')
        .eq('ticket_id', ticketId)
        .eq(participantType === 'team' ? 'team_id' : 'participant_id', id)
        .eq('participant_type', participantType)
        .maybeSingle()
      
      const lastReadAt = readData?.last_read_at
      console.log('[Support] Fetching messages for ticket:', ticketId, 'Last read at:', lastReadAt)
      
      // Fetch messages
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*, is_new:created_at')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const newMessages = data || []
      
      // Mark which messages are new based on last_read_at
      const messagesWithReadStatus = newMessages.map(msg => {
        const isNew = lastReadAt 
          ? (new Date(msg.created_at) > new Date(lastReadAt) && msg.sender_type === 'admin')
          : (msg.sender_type === 'admin')
        
        return {
          ...msg,
          _isNew: isNew
        }
      })
      
      console.log('[Support] Messages with read status:', messagesWithReadStatus.map(m => ({
        id: m.id,
        sender: m.sender_type,
        created_at: m.created_at,
        _isNew: m._isNew
      })))
      
      // Sort messages
      const sortedMessages = sortMessagesByTime(messagesWithReadStatus)
      
      setMessages(sortedMessages)
      setOptimisticMessages([]) // Clear optimistic messages once real ones load

      // Send notifications for truly new admin messages
      const newAdminMessages = sortedMessages.filter(m => m._isNew && m.sender_type === 'admin')
      
      if (newAdminMessages.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        newAdminMessages.slice(0, 3).forEach((msg) => { // Limit to 3 notifications
          new Notification('New Support Response', {
            body: msg.message.substring(0, 100),
            icon: '/api/protected?file=cia.png',
            tag: `ticket-${ticketId}-${msg.id}`,
            requireInteraction: false,
          })
        })
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTicket?.id) {
      fetchMessages(selectedTicket.id)
      
      // Mark as read after messages load (2 seconds to give user time to see)
      const readTimeout = setTimeout(() => {
        markTicketAsRead(selectedTicket.id)
      }, 2000)
      
      const messageInterval = setInterval(() => {
        fetchMessages(selectedTicket.id)
      }, 8000)
      
      return () => {
        clearTimeout(readTimeout)
        clearInterval(messageInterval)
      }
    }
  }, [selectedTicket?.id])

  // Mark ticket as read in database
  const markTicketAsRead = async (ticketId) => {
    try {
      const id = participantType === 'team' ? teamId : participantId
      const now = new Date().toISOString()
      
      console.log('[Support] Marking ticket as read:', { ticketId, participantType, id, timestamp: now })
      
      // Upsert (insert or update) the read timestamp
      const { error } = await supabase
        .from('ticket_reads')
        .upsert({
          ticket_id: ticketId,
          participant_id: participantType === 'individual' ? id : null,
          team_id: participantType === 'team' ? id : null,
          participant_type: participantType,
          last_read_at: now
        }, {
          onConflict: 'ticket_id,participant_id,team_id,participant_type'
        })
      
      if (error) {
        console.error('Error marking ticket as read:', error)
        return
      }
      
      console.log('[Support] Successfully marked as read')
      
      // Clear unread count for this ticket in UI immediately
      setUnreadTickets(prev => {
        const updated = { ...prev }
        delete updated[ticketId]
        return updated
      })
      
      // Update messages to remove NEW badges
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          _isNew: false
        }))
      )
      
    } catch (err) {
      console.error('Error marking ticket as read:', err)
    }
  }

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
    
    if (!newMessage.trim()) {
      setMessageError('Message cannot be empty')
      return
    }

    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}`
    const clientTimestamp = new Date().toISOString()
    
    // Optimistic update - show message immediately
    const optimisticMsg = {
      id: tempId,
      ticket_id: selectedTicket.id,
      sender_type: participantType,
      message: messageContent,
      created_at: clientTimestamp,
      _isOptimistic: true
    }
    
    setOptimisticMessages(prev => [...prev, optimisticMsg])
    setNewMessage('') // Clear input immediately
    setMessageError('')
    setSendingMessage(true)

    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([
          {
            ticket_id: selectedTicket.id,
            sender_type: participantType,
            message: messageContent,
            created_at: clientTimestamp
          }
        ])
        .select()

      if (error) throw error

      // Replace optimistic message with real one
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
      
      // Add real message
      const updatedMessages = sortMessagesByTime([...messages, data[0]])
      setMessages(updatedMessages)
      
      // Update last read timestamp since we just sent a message
      markTicketAsRead(selectedTicket.id)
      
    } catch (err) {
      console.error('Error sending message:', err)
      setMessageError('Failed to send message. Please try again.')
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
      // Restore message in input
      setNewMessage(messageContent)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setMessages([]) // Clear previous messages
    setOptimisticMessages([]) // Clear optimistic messages
    setMessagesLoading(true) // Show loading immediately
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
                      filteredTickets.map((ticket) => {
                        // Calculate unread count for this ticket
                        const getUnreadCount = (ticketId) => {
                          // This will be calculated when we fetch ticket messages
                          // For now, we'll use a simple check
                          return 0 // Will be updated dynamically
                        }
                        
                        return (
                          <button
                            key={ticket.id}
                            onClick={() => handleSelectTicket(ticket)}
                            className={`w-full text-left p-3 rounded-lg transition-all text-sm relative ${
                              selectedTicket?.id === ticket.id
                                ? 'bg-blue-500/20 border border-blue-500/30'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            <div className="font-medium text-sm line-clamp-1 pr-6">{ticket.title}</div>
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
                        )
                      })
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
                        <p className="wrap-break-word whitespace-pre-wrap">{selectedTicket.description}</p>
                      </div>
                    </div>

                    {/* Loading State - show when loading and no messages yet */}
                    {messagesLoading && messages.length === 0 && optimisticMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full"
                        />
                        <p className="text-sm text-neutral-400">Loading messages...</p>
                      </div>
                    )}
                    
                    {/* Messages - show if we have any messages or optimistic messages */}
                    {(messages.length > 0 || optimisticMessages.length > 0) && (
                      <>
                        {/* Combine real and optimistic messages */}
                        {[...messages, ...optimisticMessages].map((msg, idx) => {
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
                      <motion.div 
                        key={`${msg.id}-${idx}`} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: msg._isOptimistic ? 0 : Math.min(idx * 0.02, 0.3) }}
                        className={`flex w-full ${isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`flex flex-col max-w-[95%] gap-1 min-w-0`}>
                          {/* Sender name */}
                          <div className={`text-xs font-semibold px-1 flex items-center gap-2 ${isAdmin ? 'text-blue-400 text-left' : 'text-gray-400 text-right'}`}>
                            <span>{isAdmin ? '👤 Admin' : '👤 You'}</span>
                            {msg._isOptimistic && (
                              <span className="text-[10px] text-neutral-500">
                                Sending...
                              </span>
                            )}
                          </div>
                          
                          {/* Message bubble */}
                          <div
                            className={`px-4 py-2 rounded-2xl text-sm font-medium wrap-break-word ${
                              isAdmin
                                ? 'bg-blue-500 text-white rounded-tl-none shadow-lg'
                                : msg._isOptimistic 
                                  ? 'bg-green-500/70 text-white rounded-tr-none shadow-lg'
                                  : 'bg-green-500 text-white rounded-tr-none shadow-lg'
                            }`}
                          >
                            {msg.message}
                          </div>
                          
                          {/* Timestamp */}
                          <div className={`text-xs text-neutral-500 px-1 ${isAdmin ? 'text-left' : 'text-right'}`}>
                            {msg._isOptimistic ? 'Just now' : formatMessageTime(msg.created_at)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                      </>
                    )}
                    
                    {/* Empty state - no messages and not loading */}
                    {!messagesLoading && messages.length === 0 && optimisticMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <MessageCircle className="w-12 h-12 opacity-20" />
                        <p className="text-sm text-neutral-500">No messages yet</p>
                        <p className="text-xs text-neutral-600">Start the conversation below</p>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="shrink-0 border-t border-white/10 p-4 sm:p-6 space-y-3">
                  {messageError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-300 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20 flex items-center gap-2"
                    >
                      <span>✕</span>
                      <span>{messageError}</span>
                    </motion.div>
                  )}
                  <textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                    required
                    disabled={selectedTicket.resolved}
                    rows="2"
                    className="w-full glass-input p-3 text-sm resize-y min-h-[60px] max-h-[150px]"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-neutral-500">Press Enter to send, Shift+Enter for new line</span>
                    <Button
                      type="submit"
                      disabled={sendingMessage || selectedTicket.resolved || !newMessage.trim()}
                      className="h-10 glass-button flex items-center justify-center gap-2 text-sm px-6"
                    >
                      <Send className="w-4 h-4" />
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
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
