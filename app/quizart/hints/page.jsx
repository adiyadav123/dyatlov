'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function QuizArtHintsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [hints, setHints] = useState([])
  const [loading, setLoading] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Form states
  const [textHint, setTextHint] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imageCaption, setImageCaption] = useState('')
  const [imagePath, setImagePath] = useState('')

  useEffect(() => {
    const auth = sessionStorage.getItem('quizart_admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchHints()
    }
  }, [])

  const handleAdminLogin = () => {
    if (adminPassword === 'admin@site') {
      setIsAuthenticated(true)
      sessionStorage.setItem('quizart_admin_auth', 'true')
      fetchHints()
    } else {
      alert('Invalid password')
    }
  }

  const fetchHints = async () => {
    try {
      const { data, error } = await supabase
        .from('quizart_hints')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setHints(data || [])
    } catch (err) {
      console.error('Failed to fetch hints:', err)
    }
  }

  const handleAddTextHint = async () => {
    if (!textHint.trim()) {
      alert('Please enter hint text')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('quizart_hints').insert([{
        hint_type: 'text',
        content: textHint.trim(),
        created_by: 'admin',
        is_active: true
      }])

      if (error) throw error
      
      setTextHint('')
      fetchHints()
      alert('Text hint added successfully!')
    } catch (err) {
      console.error('Failed to add hint:', err)
      alert('Failed to add hint')
    } finally {
      setLoading(false)
    }
  }

  const handleAddImageHint = async () => {
    if (!imagePath.trim()) {
      alert('Please enter image URL or path')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('quizart_hints').insert([{
        hint_type: 'image',
        content: imagePath.trim(),
        caption: imageCaption.trim() || null,
        created_by: 'admin',
        is_active: true
      }])

      if (error) throw error
      
      setImagePath('')
      setImageCaption('')
      setImageFile(null)
      fetchHints()
      alert('Image hint added successfully!')
    } catch (err) {
      console.error('Failed to add hint:', err)
      alert('Failed to add hint')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHint = async (id) => {
    if (!confirm('Are you sure you want to delete this hint?')) return

    try {
      const { error } = await supabase
        .from('quizart_hints')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchHints()
    } catch (err) {
      console.error('Failed to delete hint:', err)
      alert('Failed to delete hint')
    }
  }

  const toggleHintActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('quizart_hints')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchHints()
    } catch (err) {
      console.error('Failed to update hint:', err)
      alert('Failed to update hint')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login - QuizArt Hints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Admin Password</Label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">QuizArt Hints Management</h1>
          <Button onClick={() => router.push('/quizart')} variant="outline">
            Back to Quiz
          </Button>
        </div>

        <Tabs defaultValue="add" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Hint</TabsTrigger>
            <TabsTrigger value="manage">Manage Hints</TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Text Hint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Hint Text</Label>
                    <textarea
                      value={textHint}
                      onChange={(e) => setTextHint(e.target.value)}
                      className="w-full min-h-[120px] px-3 py-2 border rounded-md"
                      placeholder="Enter hint text..."
                    />
                  </div>
                  <Button onClick={handleAddTextHint} disabled={loading} className="w-full">
                    Add Text Hint
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Image Hint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Image URL or Path</Label>
                    <Input
                      value={imagePath}
                      onChange={(e) => setImagePath(e.target.value)}
                      placeholder="https://i.ibb.co/xxx/image.jpg or /api/assets?file=quizart/hints/image.jpg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Use imgbb.com, imgur.com or upload to protected_files/quizart/hints/ folder
                    </p>
                  </div>
                  <div>
                    <Label>Caption (Optional)</Label>
                    <Input
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Image caption..."
                    />
                  </div>
                  <Button onClick={handleAddImageHint} disabled={loading} className="w-full">
                    Add Image Hint
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>All Hints ({hints.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hints.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hints yet</p>
                  ) : (
                    hints.map((hint) => (
                      <motion.div
                        key={hint.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 border rounded-lg `}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded `}>
                                {hint.hint_type}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded `}>
                                {hint.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {hint.hint_type === 'text' ? (
                              <p className="text-gray-800">{hint.content}</p>
                            ) : (
                              <div>
                                <img src={hint.content} alt="Hint" className="max-w-xs rounded mb-2" />
                                {hint.caption && <p className="text-sm text-gray-600">{hint.caption}</p>}
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(hint.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleHintActive(hint.id, hint.is_active)}
                            >
                              {hint.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteHint(hint.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
