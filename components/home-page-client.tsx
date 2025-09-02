
'use client'

import { useState, useCallback, useEffect } from 'react'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { AboutSection } from '@/components/about-section'
import { SubscriptionSection } from '@/components/subscription-section'
import { PaymentSection } from '@/components/payment-section'
import { SplashScreen } from '@/components/splash-screen'
import { FAQSection } from '@/components/faq-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { Footer } from '@/components/footer'

export function HomePageClient() {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; type: string; price: number }>({ name: '', type: 'monthly', price: 0 })
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handlePlanSelect = useCallback((plan: { name: string; type: string; price: number }) => {
    setSelectedPlan(plan)
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
              <PaymentSection selectedPlan={selectedPlan} />
            </div>
            <FAQSection />
            <TestimonialsSection />
            <Footer />
          </main>
        </div>
      )}
    </>
  )
}
