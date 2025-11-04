"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const DEFAULT_TRANSITIONS = {
  duration: 0.8,
  ease: [0.19, 1, 0.22, 1],
};

export default function ComingSoonPage() {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollBlur, setScrollBlur] = useState({ top: 0, bottom: 0 });
  const containerRef = useRef(null);
  const restrictedAccessRef = useRef(null);
  const comingSoonRef = useRef(null);

  const launchDate = new Date("2025-11-07T00:00:00");

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleReducedMotionChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleReducedMotionChange);

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      [restrictedAccessRef, comingSoonRef].forEach((ref) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distX = e.clientX - centerX;
          const distY = e.clientY - centerY;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < 200) {
            const strength = (200 - distance) / 200;
            const rotateX = (distY / distance) * strength * 5;
            const rotateY = (-distX / distance) * strength * 5;
            const scale = 1 + strength * 0.05;

            ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
            ref.current.style.filter = `drop-shadow(0 0 ${strength * 15}px rgba(217, 119, 6, ${strength * 0.5}))`;
          } else {
            ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
            ref.current.style.filter = "drop-shadow(0 0 0px rgba(217, 119, 6, 0))";
          }
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Scroll blur effect
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;

      // Calculate blur amount based on scroll position
      const topBlur = Math.min(scrollTop / 100, 10);
      const bottomBlur = Math.min((docHeight - scrollTop) / 100, 10);

      setScrollBlur({ top: topBlur, bottom: bottomBlur });

      // Apply filter to body for color dullness effect
      const topDullness = Math.min(scrollTop / 500, 0.4);
      const bottomDullness = Math.min((docHeight - scrollTop) / 500, 0.4);
      const maxDullness = Math.max(topDullness, bottomDullness);

      if (containerRef.current) {
        containerRef.current.style.filter = `saturate(${1 - maxDullness * 0.5})`;
      }
    };

    window.addEventListener("scroll", handleScroll);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeRemaining({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24) + Math.floor(difference / (1000 * 60 * 60 * 24)) * 24,
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      mediaQuery.removeEventListener("change", handleReducedMotionChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!mounted) return null;

  const getTransition = (transition) => {
    if (prefersReducedMotion) {
      return {
        ...transition,
        duration: 0.01,
      };
    }
    return transition;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] },
    },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-stone-950 text-white overflow-hidden relative"
      role="main"
      aria-label="The Dyatlov Chronicles - Coming Soon Experience"
    >
      <div className="fixed inset-0 bg-gradient-to-br from-stone-950 via-neutral-900 to-stone-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent"
        />
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(217, 119, 6, ${Math.random() * 0.5 + 0.2})`,
            }}
            animate={{
              y: [0, Math.random() * -100 - 50, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(217, 119, 6, 0.1) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(217, 119, 6, 0.1) 1px, transparent 1px)`,
          backgroundSize: "100px 100px",
        }}
      />

      <div className="relative z-10">
        <motion.section
          style={{ y: y1, opacity, scale }}
          className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="mb-16"
          >
            <motion.div
              ref={restrictedAccessRef}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-600/10 border border-amber-600/20 backdrop-blur-sm hover:bg-amber-600/20 hover:border-amber-600/40 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              role="status"
              aria-label="Status: Restricted Access"
              tabIndex={0}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={getTransition({ duration: 2, repeat: Infinity })}
                className="w-2 h-2 bg-amber-500 rounded-full"
                aria-hidden="true"
              />
              <span className="text-amber-200/90 text-base tracking-widest font-cormorant-garamond font-600">
                RESTRICTED ACCESS
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-center mb-12 max-w-full px-2"
          >
            <motion.h1
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0" }}
              transition={getTransition({ duration: 1.5, delay: 0.3 })}
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[11rem] mb-6 leading-tight md:leading-none tracking-tight bg-gradient-to-br from-amber-200 via-orange-300 to-amber-500 bg-clip-text text-transparent break-words font-cormorant-sc font-700"
            >
              THE DYATLOV CHRONICLES
            </motion.h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-stone-300 text-2xl md:text-3xl leading-relaxed font-light mb-6 font-cormorant-garamond"
            >
              Some mysteries are meant to be solved.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-stone-500 text-xl md:text-2xl leading-relaxed font-light font-cormorant-garamond"
            >
              Are you ready to uncover what lies beneath?
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-10"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-stone-600 text-sm tracking-wider font-cormorant-garamond font-600">
                SCROLL
              </span>
              <motion.div
                animate={{ scaleY: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-px h-12 bg-gradient-to-b from-stone-600 to-transparent origin-top"
              />
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          style={{ y: y2 }}
          className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-stone-400 text-2xl md:text-3xl leading-relaxed font-light mb-6 font-cormorant-garamond"
            >
              Others are meant to consume you.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-stone-500 text-lg md:text-xl leading-relaxed font-light font-cormorant-garamond"
            >
              The truth hides in the shadows, waiting to be discovered.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="mb-16"
          >
            <motion.div
              ref={comingSoonRef}
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(217, 119, 6, 0.3)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-600/20 backdrop-blur-sm hover:from-amber-600/20 hover:to-orange-600/20 hover:border-amber-600/40 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 cursor-pointer"
              role="heading"
              aria-level="2"
              tabIndex={0}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={getTransition({ duration: 2.5, repeat: Infinity })}
                className="w-2.5 h-2.5 bg-amber-500 rounded-full"
                aria-hidden="true"
              />
              <span className="text-amber-200 text-2xl md:text-3xl tracking-wider font-cormorant-garamond font-700">
                COMING SOON
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="w-full max-w-5xl mb-20"
          >
            <div className="flex items-center justify-center gap-6 md:gap-8 countdown">
              {[
                { label: "HOURS", value: timeRemaining.hours },
                { label: "MINUTES", value: timeRemaining.minutes },
                { label: "SECONDS", value: timeRemaining.seconds },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={getTransition({ duration: 0.6, delay: 0.3 + index * 0.1 })}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative group"
                  role="timer"
                  aria-label={`${item.label}: ${String(item.value).padStart(2, "0")}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="bg-stone-900/50 backdrop-blur-sm border border-stone-800/50 rounded-2xl p-8 md:p-10 hover:border-amber-600/30 hover:bg-stone-900/70 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                  >
                    <motion.div
                      key={timeRemaining[item.label.toLowerCase()]}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={getTransition({ duration: 0.3 })}
                      className="text-6xl md:text-7xl font-bold text-white mb-3 tabular-nums"
                      aria-hidden="true"
                    >
                      {String(item.value).padStart(2, "0")}
                    </motion.div>
                    <div className="text-sm md:text-base text-stone-500 tracking-[0.3em] font-cormorant-garamond font-600">
                      {item.label}
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={getTransition({ duration: 0.3 })}
                    className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0 rounded-2xl"
                    aria-hidden="true"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={getTransition({ duration: 0.8, delay: 0.2 })}
              className="text-4xl md:text-5xl text-white mb-8 font-cormorant-sc font-600"
            >
              What Awaits You
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-stone-400 text-lg md:text-xl leading-relaxed font-light font-cormorant-garamond"
            >
              Navigate through encrypted messages, decode cryptic puzzles, and
              follow trails that lead deeper into the unknown. Every clue
              matters. Every decision counts.
            </motion.p>
          </motion.div>
        </motion.section>

        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="w-full max-w-6xl"
          >
            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-32"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: "🔐",
                  title: "Encrypted",
                  desc: "Hidden in plain sight",
                },
                { icon: "🧠", title: "Challenging", desc: "Test your limits" },
                {
                  icon: "⏳",
                  title: "Time-Bound",
                  desc: "Every second counts",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="bg-stone-900/30 backdrop-blur-sm border border-stone-800/50 rounded-2xl p-10 hover:border-amber-600/30 hover:bg-stone-900/50 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                    tabIndex={0}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={getTransition({ type: "spring", stiffness: 100, delay: index * 0.1 })}
                      className="text-6xl mb-6"
                      aria-label={feature.title}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-white text-2xl mb-3 tracking-wide font-cormorant-sc font-700">
                      {feature.title}
                    </h3>
                    <p className="text-stone-500 text-base font-cormorant-garamond">{feature.desc}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={getTransition({ duration: 0.3 })}
                    className="absolute inset-0 bg-gradient-to-br from-amber-600/0 via-amber-600/5 to-amber-600/0 rounded-2xl"
                    aria-hidden="true"
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-2xl mx-auto"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-stone-900/30 backdrop-blur-sm border border-stone-800/50 rounded-2xl p-10 hover:border-amber-600/30 hover:bg-stone-900/50 transition-all duration-300"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={getTransition({ duration: 0.8, delay: 0.1 })}
                  className="text-stone-500 text-sm tracking-widest mb-6 font-cormorant-garamond font-600"
                >
                  ORGANIZED BY
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-white text-[20px] font-bold mb-6 font-cormorant-garamond"
                >
                  JCC Varanasi
                </motion.p>

                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent my-6 origin-left"
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={getTransition({ duration: 0.8, delay: 0.4 })}
                  className="text-stone-400 text-base font-cormorant-garamond space-y-5"
                >
                  {/* Event Head */}
                  <div>
                    <p className="text-amber-400 font-semibold text-lg mb-2">Event Manager</p>
                    <p className="text-white">Aditya Yadav</p>
                    <p className="text-stone-500 text-sm">President, JCC • Website & Clues</p>
                  </div>

                 <div>
                  <p className="text-amber-400 font-semibold text-lg mb-2">Creative Head</p>
                    <p className="text-white">Shubhankar M. Panth</p>
                 </div>
                  
                  <div>
                    <p className="text-amber-400 font-semibold text-lg mb-2">Graphics & Story</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {["Aditi Seth", "Aaditri Singh"].map((name, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-stone-900/30 border border-stone-800/50 rounded-full text-stone-200"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Clues & Puzzles */}
                  <div>
                    <p className="text-amber-400 font-semibold text-lg mb-2">Clues & Puzzles</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {["Kunwar Siddhant", "Sridha Raman"].map((name, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-stone-900/30 border border-stone-800/50 rounded-full text-stone-200"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <section className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={getTransition({ duration: 0.8, delay: 0.1 })}
              className="text-4xl md:text-5xl text-white mb-6 font-cormorant-sc font-600"
            >
              Event Details
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={getTransition({ duration: 0.8, delay: 0.2 })}
              className="text-stone-400 text-lg md:text-xl leading-relaxed font-light font-cormorant-garamond mb-10"
            >
              Want to know more about The Dyatlov Chronicles? Download our comprehensive event brochure to learn about the rules, timeline, prizes, and everything you need to know to participate.
            </motion.p>

            <motion.a
              href="https://drive.google.com/file/d/1UsApAKgTaNlVePNxBcTc5U-iWPufigyZ/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={getTransition({ duration: 0.8, delay: 0.3 })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-cormorant-garamond font-700 tracking-wider rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-600/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={getTransition({ duration: 3, repeat: Infinity })}
                className="text-xl"
              >
                📄
              </motion.span>
              <span>DOWNLOAD EVENT BROCHURE</span>
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={getTransition({ duration: 1.5, repeat: Infinity })}
                className="text-lg"
              >
                →
              </motion.span>
            </motion.a>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={getTransition({ duration: 0.8, delay: 0.4 })}
              className="text-stone-500 text-sm mt-6 font-cormorant-garamond"
            >
              PDF Format • Opens in Google Drive
            </motion.p>
          </motion.div>
        </section>

        <footer className="py-12 px-6 text-center border-t border-stone-900">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-stone-500 text-lg mb-4 font-cormorant-garamond"
            >
              "The truth is rarely pure and never simple."
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-stone-600 text-sm tracking-wider font-cormorant-garamond"
            >
              — Oscar Wilde
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={getTransition({ duration: 0.8, delay: 0.3 })}
              className="mt-8"
            >
              <p className="text-stone-600 text-sm tracking-widest font-cormorant-garamond font-600">
                AN INTERACTIVE TREASURE HUNT EXPERIENCE
              </p>
            </motion.div>
          </motion.div>
        </footer>
      </div>
    </div>
  );
}
