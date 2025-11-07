import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { ticketId, resolved } = await request.json()

    if (!ticketId) {
      return new Response(JSON.stringify({ error: 'Ticket ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update the ticket's resolved status
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ 
        resolved: resolved,
        resolved_at: resolved ? new Date().toISOString() : null
      })
      .eq('id', ticketId)
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      ticket: data[0] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error resolving ticket:', error)
    return new Response(JSON.stringify({ error: 'Failed to resolve ticket' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
