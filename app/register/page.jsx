'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus, Users, User, ArrowRight, Lock, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

// Generate consistent particles based on index
const generateParticle = (index) => {
  const seed = index * 12.9898 + 78.233
  const random = Math.sin(seed) * 43758.5453
  const randomValue = random - Math.floor(random)
  
  return {
    size: randomValue * 3 + 2,
    left: ((index * 7.123) % 100),
    top: ((index * 13.456) % 100),
    duration: randomValue * 12 + 15,
    delay: (index * 2.345) % 5,
    colorType: index % 3,
    yOffset: randomValue * 150 + 80,
    xOffset: randomValue * 50 - 25,
    opacity: randomValue * 0.2 + 0.05
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  const [individual, setIndividual] = useState({
    name: '',
    class: '',
    section: ''
  })

  const [team, setTeam] = useState({
    teamName: '',
    leaderName: '',
    leaderClass: '',
    leaderSection: '',
    members: []
  })

  const [currentMember, setCurrentMember] = useState({
    name: '',
    class: '',
    section: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const classes = ['9', '10', '11', '12']
  const sections = ['A', 'B', 'C', 'D', 'E']

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleIndividualSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([
          {
            name: individual.name,
            class: individual.class,
            section: individual.section,
            registration_type: 'individual'
          }
        ])
        .select()

      if (error) throw error

      localStorage.setItem('participantId', data[0].id)
      localStorage.setItem('participantType', 'individual')
      localStorage.setItem('participantName', individual.name)

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

    if (!team.leaderClass || !team.leaderSection) {
      setError('Please fill team leader class and section')
      setLoading(false)
      return
    }

    if (team.members.length === 0) {
      setError('Please add at least one team member')
      setLoading(false)
      return
    }

    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([
          {
            team_name: team.teamName,
            team_leader_name: team.leaderName,
            team_leader_class: team.leaderClass,
            team_leader_section: team.leaderSection
          }
        ])
        .select()

      if (teamError) throw teamError

      const teamId = teamData[0].id

      // Insert team leader as first member
      const leaderMember = {
        team_id: teamId,
        member_name: team.leaderName,
        class: team.leaderClass,
        section: team.leaderSection,
        is_leader: true
      }

      // Insert other members
      const membersToInsert = [
        leaderMember,
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

      router.push('/start')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
    },
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(120,119,198,0.15),rgba(255,119,180,0.05))]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5 }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-900/20 via-transparent to-transparent rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-amber-900/20 via-transparent to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Floating particles with consistent generation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => {
          const particle = generateParticle(i)
          const bgColor = particle.colorType === 0 
            ? `rgba(168, 85, 247, ${particle.opacity})`
            : particle.colorType === 1
            ? `rgba(139, 92, 246, ${particle.opacity})`
            : `rgba(217, 119, 6, ${particle.opacity * 0.6})`

          return (
            <motion.div
              key={i}
              className="absolute rounded-full backdrop-blur-md"
              style={{
                width: particle.size + 'px',
                height: particle.size + 'px',
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                background: bgColor,
              }}
              animate={{
                y: [0, -particle.yOffset, 0],
                x: [0, particle.xOffset, 0],
                opacity: [particle.opacity * 0.2, particle.opacity * 1.5, particle.opacity * 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          )
        })}
      </div>

      {/* Subtle animated grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)`,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 py-12">
        <div className="w-full max-w-2xl">
          
          {/* Header with animations */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center justify-center gap-3 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Lock className="w-5 h-5 text-violet-400" />
              </motion.div>
              <span className="text-xs font-bold text-violet-300 tracking-[0.15em]">
                INVESTIGATION PORTAL
              </span>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Lock className="w-5 h-5 text-violet-400" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0em" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-slate-200 via-violet-200 to-slate-300 bg-clip-text text-transparent leading-tight tracking-tight"
            >
              THE DYATLOV CHRONICLES 
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-slate-400 text-base sm:text-lg font-light tracking-wide"
            >
              Enter your credentials to begin the investigation
            </motion.p>
          </motion.div>

          {/* Registration Card with improved tab spacing */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            <Tabs defaultValue="individual" className="w-full">
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mb-10"
              >
                <TabsList className="grid w-full grid-cols-2 gap-2 bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-2xl h-auto">
                  <TabsTrigger 
                    value="individual" 
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-slate-100 data-[state=active]:shadow-lg data-[state=active]:border-white/20 text-slate-400 transition-all duration-300 rounded-2xl font-medium hover:text-slate-300 px-6 py-3"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Individual</span>
                    <span className="sm:hidden">Solo</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="team"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-slate-100 data-[state=active]:shadow-lg data-[state=active]:border-white/20 text-slate-400 transition-all duration-300 rounded-2xl font-medium hover:text-slate-300 px-6 py-3"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Team</span>
                    <span className="sm:hidden">Group</span>
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              {/* Individual Registration */}
              <TabsContent value="individual" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl hover:border-white/20 transition-all duration-300"
                >
                  <motion.div
                    className="mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div 
                      className="flex items-center gap-3 mb-3"
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-1.5 h-8 bg-gradient-to-b from-violet-400 to-violet-600 rounded-full" />
                      <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                        Solo Investigation
                      </h2>
                    </motion.div>
                    <motion.p
                      variants={itemVariants}
                      className="text-slate-400 text-sm ml-5"
                    >
                      Enter your details to begin your independent journey
                    </motion.p>
                  </motion.div>

                  <form onSubmit={handleIndividualSubmit} className="space-y-6">
                    
                    <motion.div 
                      className="space-y-3"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label htmlFor="name" className="text-slate-300 text-sm font-semibold tracking-wide">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={individual.name}
                        onChange={(e) => setIndividual({ ...individual, name: e.target.value })}
                        required
                        className="bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-300 focus:border-white/30 focus:ring-white/10 transition-all rounded-xl py-3 px-4 hover:border-white/20"
                      />
                    </motion.div>

                    <motion.div 
                      className="grid grid-cols-2 gap-5"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div 
                        className="space-y-3"
                        variants={itemVariants}
                      >
                        <Label htmlFor="class" className="text-slate-300 text-sm font-semibold tracking-wide">
                          Class
                        </Label>
                        <Select
                          value={individual.class}
                          onValueChange={(value) => setIndividual({ ...individual, class: value })}
                        >
                          <SelectTrigger className="bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 focus:border-white/30 focus:ring-white/10 rounded-xl hover:border-white/20 transition-all py-3 px-4">
                            <SelectValue placeholder="Select class" className="text-slate-300" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900/95 border border-white/10 backdrop-blur-xl">
                            {classes.map((cls) => (
                              <SelectItem 
                                key={cls} 
                                value={cls} 
                                className="text-slate-100 bg-slate-900 focus:bg-white/20 focus:text-white hover:bg-white/10 cursor-pointer"
                              >
                                Class {cls}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div 
                        className="space-y-3"
                        variants={itemVariants}
                      >
                        <Label htmlFor="section" className="text-slate-300 text-sm font-semibold tracking-wide">
                          Section
                        </Label>
                        <Select
                          value={individual.section}
                          onValueChange={(value) => setIndividual({ ...individual, section: value })}
                        >
                          <SelectTrigger className="bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 focus:border-white/30 focus:ring-white/10 rounded-xl hover:border-white/20 transition-all py-3 px-4">
                            <SelectValue placeholder="Select section" className="text-slate-100" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900/95 border border-white/10 backdrop-blur-xl">
                            {sections.map((sec) => (
                              <SelectItem 
                                key={sec} 
                                value={sec}
                                className="text-slate-100 bg-slate-900 focus:bg-white/20 focus:text-white hover:bg-white/10 cursor-pointer"
                              >
                                Section {sec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </motion.div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-300 text-sm bg-red-950/30 backdrop-blur-md border border-red-500/20 p-4 rounded-xl"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="pt-4"
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-violet-900/50 text-base disabled:opacity-50 backdrop-blur-sm"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <motion.svg
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 mr-2 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </motion.svg>
                            Registering...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            Begin Investigation
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight className="ml-2 w-5 h-5" />
                            </motion.div>
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </TabsContent>

              {/* Team Registration */}
              <TabsContent value="team" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl hover:border-white/20 transition-all duration-300"
                >
                  <motion.div
                    className="mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div 
                      className="flex items-center gap-3 mb-3"
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-1.5 h-8 bg-gradient-to-b from-violet-400 to-violet-600 rounded-full" />
                      <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                        Team Investigation
                      </h2>
                    </motion.div>
                    <motion.p
                      variants={itemVariants}
                      className="text-slate-400 text-sm ml-5"
                    >
                      Register your team of skilled investigators
                    </motion.p>
                  </motion.div>

                  <form onSubmit={handleTeamSubmit} className="space-y-6">
                    
                    {/* Team Name */}
                    <motion.div 
                      className="space-y-3"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label htmlFor="teamName" className="text-slate-300 text-sm font-semibold tracking-wide">
                        Team Name
                      </Label>
                      <Input
                        id="teamName"
                        type="text"
                        placeholder="Enter your team name"
                        value={team.teamName}
                        onChange={(e) => setTeam({ ...team, teamName: e.target.value })}
                        required
                        className="bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-300 focus:border-white/30 focus:ring-white/10 transition-all rounded-xl py-3 px-4 hover:border-white/20"
                      />
                    </motion.div>

                    {/* Team Leader Section */}
                    <motion.div
                      className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-7 space-y-5 hover:border-white/20 transition-all"
                      whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <h3 className="text-slate-200 font-semibold text-base tracking-wide">Team Leader Info</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          type="text"
                          placeholder="Team leader's name"
                          value={team.leaderName}
                          onChange={(e) => setTeam({ ...team, leaderName: e.target.value })}
                          required
                          className="bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-300 focus:border-white/30 focus:ring-white/10 rounded-xl py-3 px-4 hover:border-white/20 transition-all"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            value={team.leaderClass}
                            onValueChange={(value) => setTeam({ ...team, leaderClass: value })}
                          >
                            <SelectTrigger className="bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 focus:border-white/30 focus:ring-white/10 rounded-xl hover:border-white/20 transition-all py-3 px-4">
                              <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 border border-white/10 backdrop-blur-xl">
                              {classes.map((cls) => (
                                <SelectItem key={cls} value={cls} className="text-slate-100 bg-slate-900 focus:bg-white/20 focus:text-white hover:bg-white/10 cursor-pointer">
                                  {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={team.leaderSection}
                            onValueChange={(value) => setTeam({ ...team, leaderSection: value })}
                          >
                            <SelectTrigger className="bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 focus:border-white/30 focus:ring-white/10 rounded-xl hover:border-white/20 transition-all py-3 px-4">
                              <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 border border-white/10 backdrop-blur-xl">
                              {sections.map((sec) => (
                                <SelectItem key={sec} value={sec} className="text-slate-100 bg-slate-900 focus:bg-white/20 focus:text-white hover:bg-white/10 cursor-pointer">
                                  {sec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>

                    {/* Add Team Members Section */}
                    <motion.div
                      className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-7 space-y-5 hover:border-white/20 transition-all"
                      whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <h3 className="text-slate-200 font-semibold text-base tracking-wide">Add Team Members</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          type="text"
                          placeholder="Member name"
                          value={currentMember.name}
                          onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                          className="bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-300 focus:border-white/30 focus:ring-white/10 rounded-xl py-3 px-4 hover:border-white/20 transition-all"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            value={currentMember.class}
                            onValueChange={(value) => setCurrentMember({ ...currentMember, class: value })}
                          >
                            <SelectTrigger className="bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 focus:border-white/30 focus:ring-white/10 rounded-xl hover:border-white/20 transition-all py-3 px-4">
                              <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 border border-white/10 backdrop-blur-xl">
                              {classes.map((cls) => (
                                <SelectItem key={cls} value={cls} className="text-slate-100 bg-slate-900 focus:bg-white/20 focus:text-white hover:bg-white/10 cursor-pointer">
                                  {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={currentMember.section}
                            onValueChange={(value) => setCurrentMember({ ...currentMember, section: value })}
                          >
                            <SelectTrigger className="bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 focus:border-white/30 focus:ring-white/10 rounded-xl hover:border-white/20 transition-all py-3 px-4">
                              <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 border border-white/10 backdrop-blur-xl">
                              {sections.map((sec) => (
                                <SelectItem key={sec} value={sec} className="text-slate-100 bg-slate-900 focus:bg-white/20 focus:text-white hover:bg-white/10 cursor-pointer">
                                  {sec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={addMember}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/40 transition-all rounded-xl py-3 font-semibold flex items-center justify-center gap-2 backdrop-blur-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Member
                      </motion.button>
                    </motion.div>

                    {/* Team Members List */}
                    {team.leaderName && (
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Label className="text-slate-300 text-sm font-semibold">
                          Participants ({team.members.length + 1})
                        </Label>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                          {/* Team Leader */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between bg-gradient-to-r from-amber-500/20 to-amber-600/10 backdrop-blur-md border border-amber-500/30 p-4 rounded-xl hover:border-amber-500/50 transition-all"
                          >
                            <div className="text-slate-100 flex-1">
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-amber-400" />
                                <span className="font-semibold text-white">{team.leaderName}</span>
                              </div>
                              <span className="text-slate-400 text-sm ml-6">
                                {team.leaderClass}-{team.leaderSection}
                              </span>
                            </div>
                          </motion.div>

                          {/* Team Members */}
                          {team.members.map((member, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                              className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl group hover:border-white/20 transition-all"
                            >
                              <div className="text-slate-100">
                                <span className="font-semibold text-white">{member.name}</span>
                                <span className="text-slate-400 text-sm ml-3">
                                  {member.class}-{member.section}
                                </span>
                              </div>
                              <motion.button
                                type="button"
                                onClick={() => removeMember(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-slate-400 hover:text-red-400 hover:bg-red-950/20 p-2 rounded-lg transition-all"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-300 text-sm bg-red-950/30 backdrop-blur-md border border-red-500/20 p-4 rounded-xl"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )

                    }

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="pt-4"
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-violet-900/50 text-base disabled:opacity-50 backdrop-blur-sm"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <motion.svg
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 mr-2 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </motion.svg>
                            Registering Team...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            Begin Team Investigation
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight className="ml-2 w-5 h-5" />
                            </motion.div>
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>

        </div>
      </div>

      {/* Custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
