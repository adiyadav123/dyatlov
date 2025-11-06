import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify({ tickets: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
