# Gemini AI Integration for Answer Checking

## Setup Instructions

### 1. Install the Google Generative AI Package
Run this command in your terminal:
```bash
npm install @google/generative-ai
```

### 2. Get Your Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the API key

### 3. Add API Key to Environment Variables
Add this line to your `.env.local` file:
```
GEMINI_API_KEY=your_api_key_here
```

### 4. Restart Your Development Server
After adding the API key, restart your Next.js server:
```bash
# Stop the server (Ctrl+C)
# Then start it again
npm run dev
```

## How It Works

### For Easy Questions (Riddles)
- Uses Gemini AI to check answers
- Accepts spelling mistakes and typos
- Recognizes alternative correct phrasings
- Examples:
  - "Niel Armstrong" → ✅ Correct (accepts spelling mistake)
  - "Neil Armstron" → ✅ Correct (accepts typo)
  - "Armstrong" → ✅ Correct (accepts partial answer)
  - "First man on moon" → ✅ Correct (accepts description)

### For Medium and Hard Questions
- Uses exact string matching (case-insensitive)
- Can be upgraded to use Gemini if needed

## Fallback Behavior
If Gemini API fails or is not configured:
- Falls back to exact string matching
- Quiz continues to work normally
- Check console for error messages

## API Endpoint
- **Route**: `/api/check-answer`
- **Method**: POST
- **Body**:
  ```json
  {
    "userAnswer": "student's answer",
    "correctAnswer": "expected answer",
    "riddle": "the riddle text"
  }
  ```
- **Response**:
  ```json
  {
    "isCorrect": true,
    "reason": "Explanation of why it's correct/incorrect"
  }
  ```

## Cost and Rate Limits
- Gemini 1.5 Flash is free for up to 15 requests per minute
- 1500 requests per day free tier
- More than sufficient for a school quiz

## Testing
To test if Gemini is working:
1. Start a quiz
2. For an easy question with answer "Neil Armstrong", try:
   - "niel armstron" (typo)
   - "armstrong" (partial)
   - "neil" (first name only)
3. Check browser console for "Answer check:" logs
