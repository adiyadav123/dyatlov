'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Calendar, User, Search, Eye, Download } from 'lucide-react'

export default function NewspaperPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [expandedArticle, setExpandedArticle] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Track progress on page load
  useEffect(() => {
    const trackProgress = async () => {
      const participantId = localStorage.getItem('participantId')
      const teamId = localStorage.getItem('teamId')
      const participantType = localStorage.getItem('participantType')

      if (!participantId && !teamId) {
        router.push('/register')
        return
      }

      const id = participantType === 'team' ? teamId : participantId

      try {
        const response = await fetch('/api/progress/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: id,
            participantType,
            pageVisited: 'newspaper-1959',
          }),
        })

        if (!response.ok) {
          console.error('[Newspaper] Failed to track progress:', response.statusText)
        }
      } catch (err) {
        console.error('[Newspaper] Error tracking progress:', err)
      }

      setMounted(true)
    }

    trackProgress()
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-stone-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const newspapers = [
  {
    id: 1,
    publication: 'Тюменская Вечерняя (Tyumen Evening News)',
    date: 'February 6, 1959',
    reporter: 'Владимир Сергеевич Коваленко',
    headline: 'Elder Warns: "The Mountains This Year Are Not Merciful"',
    location: 'VIZHAY, SVERDLOVSK OBLAST',
    content: `"I have lived near these peaks my entire life," Maria told our reporter, her voice trembling with authority. "The mountains speak if you know how to listen. This year, the air feels heavy, colder than usual, and the snow carries a warning I cannot ignore. I beg the hikers—please, do not go. Something is off this season. The peaks are not welcoming."

Villagers report that Maria's warnings are rarely taken lightly. Known for her sharp intuition and decades of experience observing the mountains' moods, she has often cautioned locals about sudden snowstorms, disappearing trails, and unpredictable wildlife behavior in the high passes.

Many residents responded to her warning by lighting candles at home and leaving small charms or offerings near the trails, believing that the mountains can sense disrespect or unprepared travelers.

Several locals claim to have noticed unusual signs recently—tracks in the snow that seem to vanish, distant flickering lights at night, and strange sounds echoing from the ridges.

"Marie has never been wrong before," said Yaroslav Petrov, a longtime forester. "These mountains can be merciless. It's rare to see her so unsettled. I would advise anyone heading that way to take her words seriously."

While expedition organizers insist the hikers are well-prepared and adequately equipped for the winter conditions, villagers continue to whisper their unease.

As preparations for the expedition continue, the village remains tense. Locals keep watch along the lower trails and advise caution. Whether Maria's warnings will prevent disaster or simply serve as eerie foreshadowing remains to be seen.

But the villagers agree on one thing: the mountains this season are not to be underestimated.`,
    clues: ['Tracks that vanish', 'Strange sounds', 'Mountains speak']
  },
  {
    id: 2,
    publication: 'Пермский Вестник (Perm Herald)',
    date: 'February 8, 1959',
    reporter: 'Анатолий Константинович Морозов',
    headline: 'Students Depart for Otorten Peak: Village Expresses Concern',
    location: 'VIZHAY, SVERDLOVSK OBLAST',
    content: `A group of nine university hikers from the Ural Polytechnic Institute set out this week toward Mount Otorten, aiming to reach its peak by February 14. The team, led by Igor Dyatlov, was seen leaving Vizhay early Friday morning, carrying skis, tents, and high spirits despite worsening weather.

However, not everyone in the village approved of their journey.

Maria Stepanovna Klyueva, 81, the long-respected head of the Vizhay settlement, tried to stop them.

"The mountain is restless," she told our reporter. "Every few decades, it takes someone. I begged them not to go. I felt it — a cold in my bones I've only known once before, the year my husband vanished in those same woods."

Witnesses at the village store said Maria stood by the trailhead that morning, clutching a small wooden talisman as she spoke to the group. Her eyes fixed on each hiker, as if counting something internal rather than external.

The hikers laughed politely and thanked her for her concern before continuing on.

Later that night, several locals claimed to see strange bluish lights flickering above the northern ridge, though regional officials dismissed the reports as atmospheric phenomena.

A forester, Pavel Alekseyev, mentioned finding an extra set of footprints near the edge of the forest two days later — "bare feet, no shoes, no reason to be there," he told this paper. The tracks led toward the mountains, then abruptly stopped where they intersected with the main expedition route.

Authorities have urged residents not to spread panic, assuring the hikers are well-equipped and experienced. The expedition is expected to return in two weeks.

Still, the villagers remain uneasy. As dusk fell, Maria Stepanovna was seen lighting candles outside her home. When asked why, she only said:

"For the ones who won't come back. The snow already knows their names."`,
    clues: ['Extra footprints', 'Bare feet', 'Intersected with route']
  },
  {
    id: 3,
    publication: 'Свердловский Курьер (Sverdlovsk Courier)',
    date: 'February 12, 1959',
    reporter: 'Николай Иванович Лебедев',
    headline: 'Forester Reports Strange Voices Near Otorten',
    location: 'VIZHAY, SVERDLOVSK OBLAST',
    content: `Local forester Boris Ivanov, 48, has reported a strange and unsettling experience while marking trees along the Dyatlov expedition route on Mount Otorten. The route, frequently used by hikers from the Ural Polytechnic Institute, has long been a source of local caution due to its unpredictable terrain and harsh winter conditions.

"I was walking along the ridge, marking trees for the logging records, when I heard low murmurs," Boris told this paper. "At first, I thought it was another forester, but the voices were arguing in a way that didn't make sense. One voice was sharp and commanding, another pleading and confused. Then it went completely silent, as if the air itself was listening."

According to Boris, the murmurs were accompanied by sudden shifts in temperature and a feeling of being watched. He described an unnerving sensation, like the mountain was aware of his presence and responding to it.

"I've spent decades in these woods," he said. "I know the wind and the echoes, but this was different. It felt deliberate. Like intention behind the sound."

When asked if he believed the voices belonged to expedition members, Boris hesitated. "I don't know who they were," he finally said. "But I've never heard voices like that. Two people arguing with themselves, if that makes sense."

Authorities have dismissed the phenomenon as a natural echo caused by snow-covered cliffs and rocky walls. "It is likely the acoustics of the terrain," stated a local forestry official. "Sounds carry differently in deep valleys, and multiple layers of snow can distort and magnify noises."

However, villagers remain unconvinced. Many have shared stories of the mountain "responding" to those who venture too far. "The mountain is alive in its own way," said one elder who wished to remain anonymous. "It watches, it waits."

Hikers preparing to enter the area are urged to exercise caution and respect local advice.`,
    clues: ['Two voices one person', 'Arguing with themselves', 'Sharp and pleading']
  },
  {
    id: 4,
    publication: 'Уральская Правда (Ural Truth)',
    date: 'March 1, 1959',
    reporter: 'Евгений Петрович Соснин',
    headline: 'Nine Found on Slope: Questions Without Answers',
    location: 'VIZHAY, SVERDLOVSK OBLAST',
    content: `Rescue teams have discovered the remains of nine hikers on the slopes of Mount Otorten, putting an end to the search but raising more questions than answers. The bodies were found scattered across terrain approximately 1.5 kilometers from their last known campsite.

The tent itself presented a gruesome discovery: it was torn violently from the inside, as if the occupants had desperately sought escape.

"We found the tent first," reported search coordinator Mikhail Sharavin. "It was cut apart with force. Inside we found scattered belongings, torn sleeping bags, items strewn about as if in panic. But no sign of struggle with external forces. Just... desperate exit."

The bodies were found in various states of undress, some barefoot in subzero cold, others partially clothed despite temperatures of -30°C and below.

"It makes no sense," stated one search team member who requested anonymity. "Why would they run from their tent into that cold? What were they running from?"

Medical examination revealed injuries inconsistent with exposure or environmental causes. Some bodies bore defensive wounds—cuts on palms, broken fingernails, tissue under nails as if they had fought something or someone.

Autopsy reports are still being compiled, but preliminary findings suggest "injuries consistent with interpersonal violence," according to a medical official who declined to elaborate.

"All nine hikers died," officials stated. "The investigation will determine the exact cause."

Yet villagers whisper of inconsistencies. One resident claimed to have seen search team members marking the site with more body markers than the nine bodies found. "I counted them," the resident said. "Twelve markers for nine bodies. Three markers were removed before officials arrived."

When questioned, authorities denied this claim.

The case remains open, though answers seem determined to remain hidden.`,
    clues: ['Defensive wounds', 'Interpersonal violence', 'Twelve markers for nine']
  },
  {
    id: 5,
    publication: 'Омский Вестник (Omsk Herald)',
    date: 'February 18, 1959',
    reporter: 'Иван Борисович Сушкин',
    headline: 'Village Mourns: Warnings Went Unheeded',
    location: 'VIZHAY, SVERDLOVSK OBLAST',
    content: `A somber pall hangs over Vizhay as news spreads of the tragic deaths of nine students from the Ural Polytechnic Institute, who succumbed to the merciless elements on Mount Otorten. Villagers insist their forewarnings were disregarded by the hikers and dismissed by local authorities.

"We implored them not to venture into the mountains this year," said Tatiana Sergeeva, a lifelong resident. "The peaks are restless. The snow conceals treacherous ravines, and the wind carries whispers—omens we cannot ignore. Yet they pressed on, heedless of our cautions."

Authorities have labeled the incident an unfortunate accident caused by severe winter conditions, citing the region's notoriously unpredictable weather, subzero temperatures, and hidden ice formations.

Rescue teams reported finding tents torn from the inside, scattered belongings, and footprints vanishing into fresh snow, fueling speculation about the chaos that befell the hikers.

Residents report an atmosphere of unease lingering in the village. Candles flicker at windows, charms and talismans are placed near trailheads, and elders murmur of the mountains' ancient wrath.

Timber worker Yaroslav Petrov remarked, "The pass has always demanded respect. This winter, it seems that respect went unheeded, and the mountain claimed its due."

Several residents claim to have observed peculiar details not mentioned in official reports. One woman stated she saw fresh footprints leading back UP the mountain slope after the bodies had been discovered going DOWN. "Someone else was on that mountain," she insisted. "Someone who walked there after the main group."

When asked to clarify, authorities stated the tracks were likely made by search team members.

Yet the woman remains unconvinced. "I know footprints," she said. "These were different. Older. From the night of the incident, not from the rescue."

While officials continue to reassure the public that the tragedy was unavoidable, villagers maintain that something about the official story remains incomplete.`,
    clues: ['Footprints going UP', 'After bodies discovered', 'Someone else present']
  }
]

  useEffect(() => {
    const participantType = localStorage.getItem('participantType')
    if (!participantType) {
      router.push('/register')
    }
  }, [router])

  const filteredArticles = newspapers.filter(article =>
    article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">
                Исторический Архив Газет
              </h1>
              <p className="text-sm text-neutral-400">Historical Newspaper Archive • 1959</p>
            </div>
            <div className="text-sm text-neutral-500">
              <span className="text-neutral-400">Case #</span> 195902-DPI
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#272729] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-[#1a1a1b] border border-white/10 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-[#0079D3] mt-0.5" />
            <div>
              <h3 className="text-sm font-bold mb-1">Investigation Archive</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                These newspaper articles were published before and after the Dyatlov incident. 
                Read carefully—hidden clues exist in dates, names, and witness testimonies. 
                Cross-reference details across articles.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Articles */}
        <div className="space-y-4">
          {filteredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden"
            >
              {/* Article Header */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-2 leading-tight">
                      {article.headline}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                      <span className="font-mono">{article.publication}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {article.reporter}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#272729] hover:bg-[#343536] rounded text-xs font-medium text-neutral-300 transition-colors"
                  >
                    {expandedArticle === article.id ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Read Full
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {article.location}
                </div>
              </div>

              {/* Article Content */}
              {expandedArticle === article.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-4 text-sm leading-relaxed text-neutral-300 whitespace-pre-line border-t border-white/5"
                >
                  {article.content}

                  {/* Hidden Clues Indicator */}
                  <div className="mt-6 p-3 bg-[#272729] border border-white/5 rounded">
                    <p className="text-xs text-neutral-500 mb-2">🔍 <strong className="text-white">Potential Clues Found:</strong></p>
                    <div className="flex flex-wrap gap-2">
                      {article.clues.map((clue, i) => (
                        <span key={i} className="px-2 py-1 bg-[#0079D3]/10 border border-[#0079D3]/30 rounded text-[11px] text-[#0079D3]">
                          {clue}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            <p>No articles found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="mt-8 p-6 bg-[#1a1a1b] border border-white/10 rounded-lg">
          <h3 className="text-sm font-bold mb-3">What to look for:</h3>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li>• Mentions of extra people or strange behavior</li>
            <li>• Timeline inconsistencies (dates that don't match)</li>
            <li>• Physical evidence descriptions (footprints, voices)</li>
            <li>• Witness accounts that contradict official stories</li>
            <li>• References to medical records or patient files</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
