import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { title, description, participantType, participantId, teamId, participantName, teamName } = await request.json()

    if (!title || !description) {
      return new Response(JSON.stringify({ error: 'Title and description are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const insertData = {
      title,
      description,
      type: participantType,
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (participantType === 'team') {
      insertData.team_id = teamId
      insertData.team_name = teamName
    } else {
      insertData.participant_id = participantId
      insertData.participant_name = participantName
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([insertData])
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, ticket: data[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return new Response(JSON.stringify({ error: 'Failed to create ticket' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
