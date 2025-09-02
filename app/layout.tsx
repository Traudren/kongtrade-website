
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ChatButton } from '@/components/chat-button'
import { FloatingFAQButton } from '@/components/floating-faq-button'
import { StructuredData } from '@/components/structured-data'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KongTrade - Automated Cryptocurrency Trading Bot | AI Trading Platform',
  description: 'Professional automated cryptocurrency trading bot with AI algorithms. Supports Binance & Bybit exchanges. Start automated crypto trading with proven strategies and 24/7 support.',
  keywords: 'cryptocurrency, automated trading, trading bot, crypto bot, Binance, Bybit, AI trading, algorithmic trading, crypto signals, bitcoin trading, ethereum trading, cryptocurrency automation',
  authors: [{ name: 'KongTrade Team' }],
  creator: 'KongTrade',
  publisher: 'KongTrade',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kongtrade.com'),
  alternates: {
    canonical: 'https://kongtrade.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'KongTrade - Professional Automated Cryptocurrency Trading Bot',
    description: 'AI-powered cryptocurrency trading bot supporting Binance and Bybit. Automated trading strategies, real-time analytics, and 24/7 support for crypto traders.',
    url: 'https://kongtrade.com',
    siteName: 'KongTrade',
    images: [
      {
        url: 'https://kongtrade.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'KongTrade - Automated Cryptocurrency Trading Bot',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KongTrade - Automated Crypto Trading Bot',
    description: 'Professional AI-powered trading bot for cryptocurrency markets. Binance & Bybit integration.',
    creator: '@KongTrade_bot',
    images: ['https://kongtrade.com/logo.png'],
  },
  verification: {
    google: 'add_your_google_site_verification_code_here',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>

      </head>
      <body className={`${inter.className} soft-tech-bg light-particles`}>
        <Providers>
          <StructuredData />
          {children}
          <FloatingFAQButton />
          <ChatButton />
        </Providers>
      </body>
    </html>
  )
}
