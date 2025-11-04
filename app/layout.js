import { Inter, Cormorant_SC, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

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
  title: "The Dyatlov Chronicles - Coming Soon",
  description: "An interactive treasure hunt experience. Coming November 5, 2025.",
  keywords: ["coming soon", "interactive", "treasure hunt", "experience"],
  authors: [{ name: "The Jaipuria Computer Club & Team" }],
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
      <link rel="icon" type="image/png" href="/logo.png" />
      <link rel="apple-touch-icon" href="/logo.png" />
    </head>
      <body className={`${inter.className} antialiased`}>
        {children}
         <Analytics />
      </body>
    </html>
  )
}
