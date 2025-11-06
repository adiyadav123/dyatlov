import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { ticketId, message } = await request.json()

    if (!ticketId || !message) {
      return new Response(JSON.stringify({ error: 'Ticket ID and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const clientTimestamp = new Date().toISOString()
    console.log('[Admin API] Sending admin message with client timestamp:', clientTimestamp)

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([
        {
          ticket_id: ticketId,
          sender_type: 'admin',
          message,
          created_at: clientTimestamp
        }
      ])
      .select()

    if (error) throw error

    // Log the returned data to see if timestamp changed
    console.log('[Admin API] Message returned from DB:', {
      id: data[0].id,
      created_at: data[0].created_at,
      client_created_at: clientTimestamp,
      timestamp_changed: data[0].created_at !== clientTimestamp
    })

    await supabase
      .from('support_tickets')
      .update({ resolved: false, updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error replying to ticket:', error)
    return new Response(JSON.stringify({ error: 'Failed to send reply' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
