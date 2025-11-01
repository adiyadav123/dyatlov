'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ComingSoonPage() {
  const [glitchText, setGlitchText] = useState('CASE FILE #1959-027')
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Launch date (adjust as needed)
  const launchDate = new Date('2025-11-15T00:00:00')

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      const now = new Date()
      const difference = launchDate - now

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }, 1000)

    // Glitch effect
    const glitchInterval = setInterval(() => {
      const glitchChars = '█▓▒░!@#$%^&*'
      const original = 'CASE FILE #1959-027'
      
      // Random glitch
      if (Math.random() > 0.7) {
        const glitched = original.split('').map(char => 
          Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
        ).join('')
        setGlitchText(glitched)
        setTimeout(() => setGlitchText(original), 100)
      }
    }, 3000)

    return () => {
      clearInterval(timer)
      clearInterval(glitchInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridScroll 20s linear infinite'
        }} />
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-1 bg-red-500 animate-scanline" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* Classified stamp */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
          animate={{ opacity: 0.3, scale: 1, rotate: -15 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-20 right-10 text-red-600 text-6xl font-bold border-4 border-red-600 px-8 py-4 rotate-12 hidden md:block"
        >
          CLASSIFIED
        </motion.div>

        {/* Case file number with glitch */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-red-500 tracking-wider font-mono glitch-text">
            {glitchText}
          </h1>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-7xl font-bold mb-6 text-gray-100">
            THE DYATLOV PASS
          </h2>
          <h3 className="text-3xl md:text-5xl text-red-400 mb-8">
            INCIDENT
          </h3>
          
          <div className="border-t border-b border-red-900 py-6 my-8 max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed">
              February 1959. Nine hikers died under mysterious circumstances.
            </p>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed mt-4">
              One survived.
            </p>
            <p className="text-2xl md:text-3xl text-red-400 mt-8 font-semibold">
              For 66 years, the truth remained hidden.
            </p>
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-block border-4 border-red-600 px-12 py-6 bg-black bg-opacity-80 backdrop-blur">
            <p className="text-3xl md:text-4xl font-bold text-red-500 mb-2 tracking-widest">
              INVESTIGATION BEGINS
            </p>
            <p className="text-xl text-gray-400">COMING SOON</p>
          </div>
        </motion.div>

        {/* Countdown timer */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mb-16"
        >
          <div className="grid grid-cols-4 gap-4 md:gap-8 text-center">
            {[
              { label: 'DAYS', value: timeRemaining.days },
              { label: 'HOURS', value: timeRemaining.hours },
              { label: 'MINUTES', value: timeRemaining.minutes },
              { label: 'SECONDS', value: timeRemaining.seconds }
            ].map((item, index) => (
              <div key={index} className="bg-gray-900 border border-red-900 p-4 md:p-6 rounded">
                <div className="text-4xl md:text-6xl font-bold text-red-500 font-mono">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm text-gray-500 mt-2 tracking-wider">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cryptic message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-center max-w-2xl"
        >
          <div className="bg-gray-900 border-l-4 border-red-600 p-6 mb-8">
            <p className="text-gray-400 font-mono text-sm md:text-base italic">
              "The snow remembers what we forget..."
            </p>
            <p className="text-gray-600 text-xs mt-2">- Y.Y., October 2025</p>
          </div>

          <div className="space-y-4 text-gray-500 text-sm">
            <p>⚠️ This is an interactive investigation</p>
            <p>🧩 Solve cryptic puzzles to uncover the truth</p>
            <p>🔍 No prior knowledge required</p>
            <p>⏱️ Estimated completion: 2-3 hours</p>
          </div>
        </motion.div>

        {/* Email notification */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="mt-12"
        >
          <div className="bg-gray-900 border border-red-900 rounded-lg p-6 max-w-md">
            <p className="text-sm text-gray-400 mb-4 text-center">
              Get notified when the investigation opens:
            </p>
            <form className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                placeholder="your.email@example.com"
                className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded text-white focus:border-red-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          </div>
        </motion.div>

        {/* Footer warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="mt-16 text-center"
        >
          <p className="text-xs text-gray-700 mb-2">
            ⚠️ WARNING: Contains themes of psychological horror and violence
          </p>
          <p className="text-xs text-gray-800">
            CASE FILE STATUS: █████████ DECLASSIFIED █████████
          </p>
        </motion.div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes gridScroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        @keyframes scanline {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        .animate-scanline {
          animation: scanline 3s linear infinite;
        }

        .glitch-text {
          text-shadow: 
            2px 0 #ff0000,
            -2px 0 #00ffff;
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
