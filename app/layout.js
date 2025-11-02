import { Inter, Cormorant_SC, Cormorant_Garamond } from "next/font/google"
import "./globals.css"

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
  title: "The Hunt - Coming Soon",
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
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
