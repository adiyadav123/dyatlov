export async function POST(request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Email and code are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'THE DYATLOV CHRONICLES',
          email: 'ay971876@gmail.com'
        },
        to: [
          {
            email: email
          }
        ],
        subject: 'Password Reset Code - The Dyatlov Chronicles Investigation',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1b 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">THE LAST ECHO</h1>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999; letter-spacing: 1px;">PASSWORD RESET REQUEST</p>
            </div>
            
            <div style="padding: 40px; background: #f9f9f9;">
              <p style="color: #333; margin: 0 0 20px 0;">Hello,</p>
              
              <p style="color: #555; margin: 0 0 20px 0; line-height: 1.6;">
                We received a request to reset your password for your Dyatlov Pass Investigation account. Use the code below to proceed with the password reset.
              </p>
              
              <div style="background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #999; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase;">Your Reset Code</p>
                <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #0066cc; font-family: 'Courier New', monospace;">
                  ${code}
                </p>
              </div>
              
              <p style="color: #999; font-size: 12px; margin: 20px 0; text-align: center;">
                This code will expire in 15 minutes.
              </p>
              
              <p style="color: #555; margin: 20px 0 0 0; line-height: 1.6;">
                If you didn't request a password reset, please ignore this email. Your account remains secure.
              </p>
            </div>
            
            <div style="background: #1a1a1b; padding: 20px; text-align: center; color: #999; font-size: 11px;">
              <p style="margin: 0;">© 2025 Operation: The Dyatlov Chronicles. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      })
    })

    const responseData = await result.json()

    if (!result.ok) {
      console.error('Brevo error:', responseData)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Reset code sent to your email'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
