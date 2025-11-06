'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus, Users, User, ArrowRight, LogIn, Eye, EyeOff, KeyRound } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [mode, setMode] = useState('register')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showIndPassword, setShowIndPassword] = useState(false)
  const [showTeamPassword, setShowTeamPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  
  useEffect(() => {
    let participantType = localStorage.getItem("participantType");
    
    if (participantType) {
      router.push("/start");
    }
  }, [])
  
  const [individual, setIndividual] = useState({
    name: '',
    email: '',
    password: '',
    class: '',
    section: ''
  })

  const [team, setTeam] = useState({
    teamName: '',
    leaderName: '',
    leaderClass: '',
    leaderSection: '',
    email: '',
    password: '',
    members: []
  })

  const [currentMember, setCurrentMember] = useState({
    name: '',
    class: '',
    section: ''
  })

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const [resetData, setResetData] = useState({
    email: '',
    resetCode: '',
    newPassword: ''
  })
  const [resetStep, setResetStep] = useState(1)
  const [generatedCode, setGeneratedCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const classes = ['8','9', '10', '11', '12']
  
  // Dynamic sections based on class
  const getSectionsForClass = (classValue) => {
    if (classValue === '8' || classValue === '9') return ['A', 'B', 'C', 'D']
    if (classValue === '10' || classValue === '11') return ['A', 'B', 'C']
    if (classValue === '12') return ['A', 'B']
    return ['A', 'B', 'C', 'D'] // default
  }

  const addMember = () => {
    if (!currentMember.name || !currentMember.class || !currentMember.section) {
      setError('Please fill all member details')
      return
    }
    setTeam({
      ...team,
      members: [...team.members, currentMember]
    })
    setCurrentMember({ name: '', class: '', section: '' })
    setError('')
  }

  const removeMember = (index) => {
    setTeam({
      ...team,
      members: team.members.filter((_, i) => i !== index)
    })
  }

  const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleSendResetCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const email = resetData.email.toLowerCase()

      const { data: individual } = await supabase
        .from('participants')
        .select('id')
        .eq('email', email)
        .single()

      const { data: teamData } = await supabase
        .from('teams')
        .select('id')
        .eq('email', email)
        .single()

      if (!individual && !teamData) {
        throw new Error('Email not found')
      }

      const code = generateResetCode()
      setGeneratedCode(code)

      const { error: insertError } = await supabase
        .from('password_resets')
        .insert([
          {
            email: email,
            reset_code: code
          }
        ])

      if (insertError) throw insertError

      const response = await fetch('/api/send-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset code')
      }

      setSuccess('Reset code sent to your email! Check your inbox.')
      setResetStep(2)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const email = resetData.email.toLowerCase()

      const { data: resetRecord, error: verifyError } = await supabase
        .from('password_resets')
        .select('*')
        .eq('email', email)
        .eq('reset_code', resetData.resetCode)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (verifyError || !resetRecord) {
        throw new Error('Invalid or expired reset code')
      }

      const passwordHash = await bcrypt.hash(resetData.newPassword, 10)

      const { error: indUpdateError } = await supabase
        .from('participants')
        .update({ password_hash: passwordHash })
        .eq('email', email)

      const { error: teamUpdateError } = await supabase
        .from('teams')
        .update({ password_hash: passwordHash })
        .eq('email', email)

      if (indUpdateError && teamUpdateError) {
        throw new Error('Failed to update password')
      }

      await supabase
        .from('password_resets')
        .update({ used: true })
        .eq('id', resetRecord.id)

      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        setMode('login')
        setResetStep(1)
        setResetData({ email: '', resetCode: '', newPassword: '' })
      }, 2000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleIndividualSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate all required fields
    if (!individual.name || !individual.email || !individual.password || !individual.class || !individual.section) {
      setError('All fields are required: Name, Email, Password, Class, and Section')
      setLoading(false)
      return
    }

    try {
      const emailLower = individual.email.toLowerCase()

      // Check if email already exists in participants table
      const { data: existingParticipant } = await supabase
        .from('participants')
        .select('id')
        .eq('email', emailLower)
        .single()

      if (existingParticipant) {
        setError('This email is already registered as an individual participant. Please login to continue.')
        setLoading(false)
        return
      }

      // Check if email already exists in teams table
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('email', emailLower)
        .single()

      if (existingTeam) {
        setError('This email is already registered as a team. Please login to continue or use a different email.')
        setLoading(false)
        return
      }

      // Check if same name and section combination already exists
      const { data: existingStudent } = await supabase
        .from('participants')
        .select('id')
        .eq('name', individual.name)
        .eq('section', individual.section)
        .single()

      if (existingStudent) {
        setError('A student with this name and section already exists. If you believe this is an error, please email us at jaipuriacomputerclub@gmail.com')
        setLoading(false)
        return
      }

      const passwordHash = await bcrypt.hash(individual.password, 10)

      // Get current time - Supabase handles timezone conversion automatically
      // Just use UTC time and let Supabase store it as UTC
      const now = new Date()
      
      const { data, error } = await supabase
        .from('participants')
        .insert([
          {
            name: individual.name,
            email: individual.email.toLowerCase(),
            password_hash: passwordHash,
            class: individual.class,
            section: individual.section,
            registration_type: 'individual',
            created_at: now.toISOString()
          }
        ])
        .select()

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email is already registered. Please login to continue.')
        }
        throw error
      }

      localStorage.setItem('participantId', data[0].id)
      localStorage.setItem('participantType', 'individual')
      localStorage.setItem('participantName', individual.name)
      localStorage.setItem('participantEmail', individual.email)

      // Set cookies for middleware (new security system)
      document.cookie = `participantType=individual; path=/; max-age=604800; SameSite=Strict`
      document.cookie = `participantId=${data[0].id}; path=/; max-age=604800; SameSite=Strict`

      router.push('/start')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate all required fields
    if (!team.teamName || !team.leaderName || !team.email || !team.password || !team.leaderClass || !team.leaderSection) {
      setError('All fields are required: Team Name, Leader Name, Email, Password, Leader Class, and Leader Section')
      setLoading(false)
      return
    }

    try {
      const emailLower = team.email.toLowerCase()

      // Check if email already exists in teams table
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('email', emailLower)
        .single()

      if (existingTeam) {
        setError('This email is already registered as a team. Please login to continue.')
        setLoading(false)
        return
      }

      // Check if email exists in participants (individual)
      const { data: existingParticipant } = await supabase
        .from('participants')
        .select('id')
        .eq('email', emailLower)
        .single()

      if (existingParticipant) {
        setError('This email is already registered as an individual participant. Please use a different email or login.')
        setLoading(false)
        return
      }

      // Check if team leader with same name and section already exists
      const { data: existingLeader } = await supabase
        .from('team_members')
        .select('id')
        .eq('member_name', team.leaderName)
        .eq('section', team.leaderSection)
        .eq('is_leader', true)
        .single()

      if (existingLeader) {
        setError('A team with this leader name and section already exists. If you believe this is an error, please email us at jaipuriacomputerclub@gmail.com')
        setLoading(false)
        return
      }

      const passwordHash = await bcrypt.hash(team.password, 10)

      // Get current time - Supabase handles timezone conversion automatically
      // Just use UTC time and let Supabase store it as UTC
      const now = new Date()

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([
          {
            team_name: team.teamName,
            team_leader_name: team.leaderName,
            team_leader_class: team.leaderClass,
            team_leader_section: team.leaderSection,
            email: team.email.toLowerCase(),
            password_hash: passwordHash,
            created_at: now.toISOString()
          }
        ])
        .select()

      if (teamError) {
        if (teamError.code === '23505') {
          throw new Error('This email is already registered. Please login to continue.')
        }
        throw teamError
      }

      const teamId = teamData[0].id

      const membersToInsert = [
        {
          team_id: teamId,
          member_name: team.leaderName,
          class: team.leaderClass,
          section: team.leaderSection,
          is_leader: true
        },
        ...team.members.map(member => ({
          team_id: teamId,
          member_name: member.name,
          class: member.class,
          section: member.section,
          is_leader: false
        }))
      ]

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(membersToInsert)

      if (membersError) throw membersError

      localStorage.setItem('teamId', teamId)
      localStorage.setItem('participantType', 'team')
      localStorage.setItem('teamName', team.teamName)
      localStorage.setItem('teamLeader', team.leaderName)
      localStorage.setItem('participantEmail', team.email)

      // Set cookies for middleware (new security system)
      document.cookie = `participantType=team; path=/; max-age=604800; SameSite=Strict`
      document.cookie = `participantId=${teamId}; path=/; max-age=604800; SameSite=Strict`

      router.push('/start')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!loginData.email || !loginData.password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    try {
      const email = loginData.email.toLowerCase()

      const { data: individualData } = await supabase
        .from('participants')
        .select('*')
        .eq('email', email)
        .single()

      if (individualData) {
        const isValid = await bcrypt.compare(loginData.password, individualData.password_hash)
        if (!isValid) throw new Error('Invalid password')

        // Set localStorage (existing system)
        localStorage.setItem('participantId', individualData.id)
        localStorage.setItem('participantType', 'individual')
        localStorage.setItem('participantName', individualData.name)
        localStorage.setItem('participantEmail', individualData.email)

        // Set cookies for middleware (new security system)
        document.cookie = `participantType=individual; path=/; max-age=604800; SameSite=Strict`
        document.cookie = `participantId=${individualData.id}; path=/; max-age=604800; SameSite=Strict`

        router.push('/start')
        return
      }

      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('email', email)
        .single()

      if (teamData) {
        const isValid = await bcrypt.compare(loginData.password, teamData.password_hash)
        if (!isValid) throw new Error('Invalid password')

        // Set localStorage (existing system)
        localStorage.setItem('teamId', teamData.id)
        localStorage.setItem('participantType', 'team')
        localStorage.setItem('teamName', teamData.team_name)
        localStorage.setItem('teamLeader', teamData.team_leader_name)
        localStorage.setItem('participantEmail', teamData.email)

        // Set cookies for middleware (new security system)
        document.cookie = `participantType=team; path=/; max-age=604800; SameSite=Strict`
        document.cookie = `participantId=${teamData.id}; path=/; max-age=604800; SameSite=Strict`

        router.push('/start')
        return
      }

      throw new Error('Account not found')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-stone-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/20 via-transparent to-transparent" />
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-stone-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-white tracking-tight">
              THE DYATLOV CHRONICLES
            </h1>
            <p className="text-neutral-400 text-lg font-light tracking-wide">
              {mode === 'register' && 'Register to Begin Investigation'}
              {mode === 'login' && 'Login to Continue Investigation'}
              {mode === 'reset' && 'Reset Your Password'}
            </p>
          </motion.div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('reset'); setError(''); setSuccess(''); setResetStep(1) }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                mode === 'reset'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Reset
            </button>
          </div>

          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card rounded-3xl overflow-hidden"
            >
              <Tabs defaultValue="individual" className="w-full">
                
                <div className="p-6 pb-0">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm border border-white/10 p-1.5 rounded-2xl h-auto">
                    <TabsTrigger value="individual" className="rounded-xl data-[state=active]:bg-white/10">
                      <User className="w-4 h-4 mr-2" />
                      Individual
                    </TabsTrigger>
                    <TabsTrigger value="team" className="rounded-xl data-[state=active]:bg-white/10">
                      <Users className="w-4 h-4 mr-2" />
                      Team
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="individual" className="p-6 pt-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-2">Solo Investigation</h2>
                    <p className="text-neutral-400 text-sm">Register as an individual investigator</p>
                  </div>

                  <form onSubmit={handleIndividualSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Full Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={individual.name}
                        onChange={(e) => setIndividual({ ...individual, name: e.target.value })}
                        required
                        className="glass-input h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Email</Label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={individual.email}
                        onChange={(e) => setIndividual({ ...individual, email: e.target.value })}
                        required
                        className="glass-input h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          type={showIndPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={individual.password}
                          onChange={(e) => setIndividual({ ...individual, password: e.target.value })}
                          required
                          minLength={6}
                          className="glass-input h-12 text-base pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowIndPassword(!showIndPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                        >
                          {showIndPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500">Minimum 6 characters</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-300 text-sm font-medium">Class</Label>
                        <Select 
                          value={individual.class} 
                          onValueChange={(value) => {
                            setIndividual({ ...individual, class: value, section: '' })
                          }}
                        >
                          <SelectTrigger className="glass-input h-12">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="glass-dropdown">
                            {classes.map((cls) => (
                              <SelectItem key={cls} value={cls} className="text-white">{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-300 text-sm font-medium">Section</Label>
                        <Select 
                          value={individual.section} 
                          onValueChange={(value) => setIndividual({ ...individual, section: value })}
                          disabled={!individual.class}
                        >
                          <SelectTrigger className="glass-input h-12">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="glass-dropdown">
                            {getSectionsForClass(individual.class).map((sec) => (
                              <SelectItem key={sec} value={sec} className="text-white">{sec}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                        {error}
                      </motion.div>
                    )}

                    <Button type="submit" disabled={loading} className="glass-button w-full h-12 text-base font-medium">
                      {loading ? 'Registering...' : (
                        <span className="flex items-center">
                          Begin Investigation
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="team" className="p-6 pt-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-2">Team Investigation</h2>
                    <p className="text-neutral-400 text-sm">Register as a team of investigators</p>
                  </div>

                  <form onSubmit={handleTeamSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Team Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter team name"
                        value={team.teamName}
                        onChange={(e) => setTeam({ ...team, teamName: e.target.value })}
                        required
                        className="glass-input h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Team Leader Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter leader's name"
                        value={team.leaderName}
                        onChange={(e) => setTeam({ ...team, leaderName: e.target.value })}
                        required
                        className="glass-input h-12 text-base"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-300 text-sm font-medium">Leader's Class</Label>
                        <Select 
                          value={team.leaderClass} 
                          onValueChange={(value) => {
                            setTeam({ ...team, leaderClass: value, leaderSection: '' })
                          }}
                        >
                          <SelectTrigger className="glass-input h-12">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="glass-dropdown">
                            {classes.map((cls) => (
                              <SelectItem key={cls} value={cls} className="text-white">{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-300 text-sm font-medium">Leader's Section</Label>
                        <Select 
                          value={team.leaderSection} 
                          onValueChange={(value) => setTeam({ ...team, leaderSection: value })}
                          disabled={!team.leaderClass}
                        >
                          <SelectTrigger className="glass-input h-12">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="glass-dropdown">
                            {getSectionsForClass(team.leaderClass).map((sec) => (
                              <SelectItem key={sec} value={sec} className="text-white">{sec}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Team Email</Label>
                      <Input
                        type="email"
                        placeholder="Enter team email"
                        value={team.email}
                        onChange={(e) => setTeam({ ...team, email: e.target.value })}
                        required
                        className="glass-input h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-300 text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          type={showTeamPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={team.password}
                          onChange={(e) => setTeam({ ...team, password: e.target.value })}
                          required
                          minLength={6}
                          className="glass-input h-12 text-base pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTeamPassword(!showTeamPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                        >
                          {showTeamPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500">All team members use this password</p>
                    </div>

                    <div className="glass-section rounded-2xl p-5 space-y-4">
                      <h3 className="text-neutral-200 font-medium">Add Team Members</h3>
                      
                      <div className="space-y-3">
                        <Input
                          type="text"
                          placeholder="Member name"
                          value={currentMember.name}
                          onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                          className="glass-input h-11"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <Select 
                            value={currentMember.class} 
                            onValueChange={(value) => {
                              setCurrentMember({ ...currentMember, class: value, section: '' })
                            }}
                          >
                            <SelectTrigger className="glass-input h-11">
                              <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent className="glass-dropdown">
                              {classes.map((cls) => (
                                <SelectItem key={cls} value={cls} className="text-white">{cls}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select 
                            value={currentMember.section} 
                            onValueChange={(value) => setCurrentMember({ ...currentMember, section: value })}
                            disabled={!currentMember.class}
                          >
                            <SelectTrigger className="glass-input h-11">
                              <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent className="glass-dropdown">
                              {getSectionsForClass(currentMember.class).map((sec) => (
                                <SelectItem key={sec} value={sec} className="text-white">{sec}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button type="button" onClick={addMember} className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </div>

                    {team.members.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-neutral-200">Team Members ({team.members.length})</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                          {team.members.map((member, index) => (
                            <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-item rounded-xl p-4 flex items-center justify-between">
                              <div className="text-neutral-200">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-neutral-400 text-sm ml-3">{member.class}-{member.section}</span>
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeMember(index)} className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10">
                                <X className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                        {error}
                      </motion.div>
                    )}

                    <Button type="submit" disabled={loading} className="glass-button w-full h-12 text-base font-medium">
                      {loading ? 'Registering Team...' : 'Begin Team Investigation'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-8"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
                <p className="text-neutral-400 text-sm">Continue your investigation</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-neutral-300 text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="glass-input h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-300 text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="glass-input h-12 text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    {error}
                  </motion.div>
                )}

                <Button type="submit" disabled={loading} className="glass-button w-full h-12 text-base font-medium">
                  {loading ? 'Logging in...' : (
                    <span className="flex items-center">
                      <LogIn className="mr-2 w-5 h-5" />
                      Login
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-sm text-neutral-400 hover:text-white transition-colors underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {mode === 'reset' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-8"
            >
              <div className="mb-8 text-center">
                <KeyRound className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">Reset Password</h2>
                <p className="text-neutral-400 text-sm">
                  {resetStep === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}
                </p>
              </div>

              {resetStep === 1 ? (
                <form onSubmit={handleSendResetCode} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-neutral-300 text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter your registered email"
                      value={resetData.email}
                      onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                      required
                      className="glass-input h-12 text-base"
                    />
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-300 text-sm bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                      {success}
                    </motion.div>
                  )}

                  <Button type="submit" disabled={loading} className="glass-button w-full h-12 text-base font-medium">
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-neutral-300 text-sm font-medium">Reset Code</Label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={resetData.resetCode}
                      onChange={(e) => setResetData({ ...resetData, resetCode: e.target.value })}
                      required
                      maxLength={6}
                      className="glass-input h-12 text-base font-mono text-center text-2xl tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-300 text-sm font-medium">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={resetData.newPassword}
                        onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                        required
                        minLength={6}
                        className="glass-input h-12 text-base pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500">Minimum 6 characters</p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-300 text-sm bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                      {success}
                    </motion.div>
                  )}

                  <Button type="submit" disabled={loading} className="glass-button w-full h-12 text-base font-medium">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

        </div>
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }

        .glass-input::placeholder {
          color: rgba(163, 163, 163, 0.6);
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
        }

        .glass-dropdown {
          background: rgba(23, 23, 23, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          transform: translateY(-1px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .glass-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .glass-section {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .glass-item {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }

        .glass-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}
