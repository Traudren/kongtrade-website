
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'

interface SubscriptionSectionProps {
  onPlanSelect?: (plan: { name: string; type: string; price: number }) => void
}

const monthlyPlans = [
  {
    name: 'Basic',
    price: 50,
    limit: 'up to 25% of deposit',
    features: [
      'Automated trading',
      'Basic strategies',
      'Binance support',
      'Email support'
    ]
  },
  {
    name: 'Professional',
    price: 80,
    limit: 'up to 40% of deposit',
    features: [
      'Advanced strategies',
      'Binance & Bybit support',
      'Priority support',
      'Detailed analytics'
    ],
    popular: true
  },
  {
    name: 'Premium',
    price: 120,
    limit: 'unlimited',
    features: [
      'All features',
      'Custom strategies',
      '24/7 VIP support',
      'Personal manager'
    ]
  }
]

const quarterlyPlans = [
  { name: 'Basic', price: 135, originalPrice: 150 },
  { name: 'Professional', price: 215, originalPrice: 240, popular: true },
  { name: 'Premium', price: 320, originalPrice: 360 }
]

export function SubscriptionSection({ onPlanSelect }: SubscriptionSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [planType, setPlanType] = useState<'monthly' | 'quarterly'>('monthly')

  const handlePlanSelect = useCallback((e: React.MouseEvent, planName: string, price: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const planKey = `${planType}-${planName}`
    setSelectedPlan(planKey)
    
    // Notify parent component about plan selection
    if (onPlanSelect) {
      onPlanSelect({
        name: planName,
        type: planType,
        price: price
      })
    }
    
    // Smooth scroll to payment section after a short delay
    setTimeout(() => {
      const paymentSection = document.getElementById('payment')
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }, [planType, onPlanSelect])

  const handlePlanTypeChange = useCallback((e: React.MouseEvent, newPlanType: 'monthly' | 'quarterly') => {
    e.preventDefault()
    e.stopPropagation()
    
    setPlanType(newPlanType)
    setSelectedPlan(null)
    // Clear parent selection
    if (onPlanSelect) {
      onPlanSelect({ name: '', type: newPlanType, price: 0 })
    }
  }, [onPlanSelect])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="flex-1"
    >
      <div className="glass-effect rounded-2xl p-6 card-glow glow-light-cyan">
        <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6">
          Choose Your Plan
        </h2>

        {/* Plan type toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={(e) => handlePlanTypeChange(e, 'monthly')}
              className={`px-5 py-2 rounded-xl transition-all text-sm ${
                planType === 'monthly'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={(e) => handlePlanTypeChange(e, 'quarterly')}
              className={`px-5 py-2 rounded-xl transition-all text-sm ${
                planType === 'quarterly'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              3 Months
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {planType === 'monthly' ? (
            monthlyPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative border rounded-xl p-5 cursor-pointer transition-all ${
                  selectedPlan === `${planType}-${plan.name}`
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                } ${plan.popular ? 'ring-2 ring-cyan-400' : ''}`}
                onClick={(e) => handlePlanSelect(e, plan.name, plan.price)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                    <p className="text-sm text-cyan-400">{plan.limit}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${plan.price}</div>
                    <div className="text-xs text-gray-400">/ month</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-xs text-gray-300">
                      <Check className="h-3 w-3 text-cyan-400 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                {selectedPlan === `${planType}-${plan.name}` && (
                  <div className="absolute top-4 right-4">
                    <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            quarterlyPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative border rounded-xl p-5 cursor-pointer transition-all ${
                  selectedPlan === `${planType}-${plan.name}`
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                } ${plan.popular ? 'ring-2 ring-cyan-400' : ''}`}
                onClick={(e) => handlePlanSelect(e, plan.name, plan.price)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                    <p className="text-sm text-green-400">
                      Save ${plan.originalPrice - plan.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${plan.price}</div>
                    <div className="text-xs text-gray-400 line-through">${plan.originalPrice}</div>
                  </div>
                </div>

                {selectedPlan === `${planType}-${plan.name}` && (
                  <div className="absolute top-4 right-4">
                    <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>• Automatic subscription renewal</p>
          <p>• 30-day money back guarantee</p>
        </div>
      </div>
    </motion.div>
  )
}
