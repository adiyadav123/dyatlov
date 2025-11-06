import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { title, message } = await request.json()

    if (!title || !message) {
      return new Response(JSON.stringify({ error: 'Title and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          title,
          message,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Notification API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    // If table doesn't exist, return empty array instead of error
    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        console.warn('Notifications table does not exist yet:', error.message)
        return new Response(JSON.stringify({ notifications: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      throw error
    }

    return new Response(JSON.stringify({ notifications: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch notifications', notifications: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
