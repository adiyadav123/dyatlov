# QuizArt Hints System - README

## Overview
The hints system allows admins to post helpful clues (text or images with captions) for quiz participants.

## Database Setup
1. Run the SQL migration in Supabase:
   - Open Supabase SQL Editor
   - Execute `QUIZART_HINTS_MIGRATION.sql`

## Admin Access
- **URL**: `/quizart/hints`
- **Password**: `admin123` (change in production!)
- **Session**: Stored in sessionStorage (persists during browser session)

## Features

### Admin Functions (`/quizart/hints`)
1. **Add Text Hints**
   - Simple text messages
   - Displayed with numbering

2. **Add Image Hints**
   - Image path: `/api/assets?file=quizart/hints/image.jpg`
   - Optional caption
   - Images must be uploaded to `protected_files/quizart/hints/` first

3. **Manage Hints**
   - View all hints (active and inactive)
   - Toggle active/inactive status
   - Delete hints
   - Sorted by display_order, then creation date

### Public View (`/quizart/view-hints`)
- Shows only active hints
- Accessible from main quiz page and during quiz
- Numbered display
- Images shown with captions

## File Structure
```
protected_files/quizart/hints/    # Upload hint images here
app/quizart/hints/                # Admin management page
app/quizart/view-hints/           # Public viewing page
```

## How to Add Image Hints
### Option 1: External Image URLs (Recommended)
1. Upload your image to imgbb.com or imgur.com
2. Copy the direct image URL (e.g., `https://i.ibb.co/xxx/image.jpg`)
3. Go to `/quizart/hints` (admin page)
4. Login with password
5. Enter the image URL in "Image URL or Path" field
6. Add optional caption
7. Click "Add Image Hint"

### Option 2: Local Files
1. Upload image to `protected_files/quizart/hints/your-image.jpg`
2. Go to `/quizart/hints` (admin page)
3. Login with password
4. Enter image path: `/api/assets?file=quizart/hints/your-image.jpg`
5. Add optional caption
6. Click "Add Image Hint"

## Access Points
- **Registration Page**: "Hints 💡" link at bottom
- **Quiz Page**: "💡 Hints" button in header
- **Direct**: `/quizart/view-hints`

## Database Schema
```sql
quizart_hints (
  id UUID,
  hint_type TEXT ('text' | 'image'),
  content TEXT,
  caption TEXT,
  created_by TEXT,
  is_active BOOLEAN,
  display_order INTEGER,
  created_at TIMESTAMPTZ
)
```
