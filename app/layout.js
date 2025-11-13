import { Inter, Cormorant_SC, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  variable: "--font-cormorant-sc",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata = {
  title: "The Dyatlov Chronicles",
  description: "An interactive treasure hunt experience. Ending November 30, 2025.",
  keywords: ["coming soon", "interactive", "treasure hunt", "experience"],
  authors: [{ name: "The Jaipuria Computer Club & Team" }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  creator: "The Jaipuria Computer Club",
}

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${cormorantSC.variable} ${cormorantGaramond.variable}`}
    >
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="google-site-verification" content="HONwoEinu5H8XVIyiBFCCOEfWT__Zwfxu9hE9Y8cPtU" />
      <link rel="icon" type="image/png" href="/favicon" />
      <link rel="apple-touch-icon" href="/favicon" />
    </head>
      <body className={`${inter.className} antialiased`}>
        {children}
         <Analytics />
         <SpeedInsights />
      </body>
    </html>
  )
}
