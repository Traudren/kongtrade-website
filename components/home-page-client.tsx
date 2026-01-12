
'use client'

import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { AboutSection } from '@/components/about-section'
import { SubscriptionSection } from '@/components/subscription-section'
import { PaymentSection } from '@/components/payment-section'
import { SplashScreen } from '@/components/splash-screen'

// Lazy load компонентов, которые загружаются ниже на странице
const FAQSection = lazy(() => import('@/components/faq-section').then(m => ({ default: m.FAQSection })))
const TestimonialsSection = lazy(() => import('@/components/testimonials-section').then(m => ({ default: m.TestimonialsSection })))
const Footer = lazy(() => import('@/components/footer').then(m => ({ default: m.Footer })))

export function HomePageClient() {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; type: string; price: number; telegramChannel?: boolean }>({ name: '', type: 'monthly', price: 0 })
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Check for hash after component mounts (client-side only)
    const hasHash = typeof window !== 'undefined' && window.location.hash
    // If there's a hash, show splash screen for shorter time (500ms), otherwise 3 seconds
    const splashTime = hasHash ? 500 : 3000
    
    const timer = setTimeout(() => {
      setShowSplash(false)
      // After splash screen is hidden, check if there's a hash in URL and scroll to it
      if (hasHash) {
        const hash = window.location.hash.substring(1) // Remove the '#' symbol
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 200)
      }
    }, splashTime)
    return () => clearTimeout(timer)
  }, [])

  // Handle hash navigation when component is already mounted (no splash screen)
  useEffect(() => {
    if (!showSplash && typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1)
      const element = document.getElementById(hash)
      if (element) {
        // Small delay to ensure page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      }
    }
  }, [showSplash])

  const handlePlanSelect = useCallback((plan: { name: string; type: string; price: number; telegramChannel?: boolean }) => {
    // Only set plan if price is greater than 0
    if (plan.price > 0) {
    setSelectedPlan(plan)
    } else {
      setSelectedPlan({ name: '', type: 'monthly', price: 0 })
    }
  }, [])

  return (
    <>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <div className="min-h-screen gradient-bg">
          <Header />
          <main className="pt-20">
            <HeroSection />
            <AboutSection />
            <div id="pricing" className="px-4 py-16 max-w-7xl mx-auto">
              <SubscriptionSection onPlanSelect={handlePlanSelect} />
            </div>
            <div id="payment">
              <PaymentSection selectedPlan={selectedPlan.price > 0 ? selectedPlan : undefined} />
            </div>
            <Suspense fallback={<div className="min-h-[400px]" />}>
            <FAQSection />
            </Suspense>
            <Suspense fallback={<div className="min-h-[400px]" />}>
            <TestimonialsSection />
            </Suspense>
            <Suspense fallback={<div className="min-h-[200px]" />}>
            <Footer />
            </Suspense>
          </main>
        </div>
      )}
    </>
  )
}
