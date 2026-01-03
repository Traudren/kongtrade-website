
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'

interface SubscriptionSectionProps {
  onPlanSelect?: (plan: { name: string; type: string; price: number; telegramChannel?: boolean }) => void
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
      'Telegram channel with orders and custom results',
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
  const [telegramChannelEnabled, setTelegramChannelEnabled] = useState(false)

  const handlePlanSelect = useCallback((e: React.MouseEvent, planName: string, basePrice: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const planKey = `${planType}-${planName}`
    setSelectedPlan(planKey)
    
    // Set telegram channel enabled by default for Premium, reset for non-Premium
    if (planName === 'Premium') {
      setTelegramChannelEnabled(true)
    } else {
      setTelegramChannelEnabled(false)
    }
    
    // Calculate price with telegram channel if Premium (enabled by default)
    let finalPrice = basePrice
    let telegramChannel = false
    if (planName === 'Premium') {
      // Telegram channel is enabled by default for Premium
      if (planType === 'monthly') {
        finalPrice = basePrice + 20 // 120 + 20 = 140
      } else {
        finalPrice = basePrice + 60 // 320 + 60 = 380
      }
      telegramChannel = true
    }
    
    // Notify parent component about plan selection
    if (onPlanSelect) {
      onPlanSelect({
        name: planName,
        type: planType,
        price: finalPrice,
        telegramChannel: telegramChannel
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
    setTelegramChannelEnabled(false)
    // Clear parent selection
    if (onPlanSelect) {
      onPlanSelect({ name: '', type: newPlanType, price: 0 })
    }
  }, [onPlanSelect])

  const updatePlanWithTelegram = useCallback((newValue: boolean) => {
    // If Premium plan is selected, update the price based on telegram channel
    if (selectedPlan?.endsWith('-Premium')) {
      const planName = 'Premium'
      const basePrice = planType === 'monthly' ? 120 : 320
      let finalPrice = basePrice
      if (newValue) {
        if (planType === 'monthly') {
          finalPrice = basePrice + 20 // 120 + 20 = 140
        } else {
          finalPrice = basePrice + 60 // 320 + 60 = 380
        }
      }
      
      if (onPlanSelect) {
        onPlanSelect({
          name: planName,
          type: planType,
          price: finalPrice,
          telegramChannel: newValue
        })
      }
    }
  }, [selectedPlan, planType, onPlanSelect])

  const handleTelegramChannelToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newValue = !telegramChannelEnabled
    setTelegramChannelEnabled(newValue)
    updatePlanWithTelegram(newValue)
  }, [telegramChannelEnabled, updatePlanWithTelegram])

  const handleTelegramChannelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    
    const newValue = e.target.checked
    setTelegramChannelEnabled(newValue)
    updatePlanWithTelegram(newValue)
  }, [updatePlanWithTelegram])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="flex-1"
    >
      <div className="glass-effect rounded-2xl p-4 sm:p-6 card-glow glow-light-cyan">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
          Choose Your Plan
        </h2>

        {/* Plan type toggle */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={(e) => handlePlanTypeChange(e, 'monthly')}
              className={`px-4 sm:px-5 py-2 rounded-xl transition-all text-xs sm:text-sm ${
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
              className={`px-4 sm:px-5 py-2 rounded-xl transition-all text-xs sm:text-sm ${
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
        <div className="space-y-3 sm:space-y-4">
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
                    {plan.name === 'Premium' && selectedPlan === `${planType}-${plan.name}` && telegramChannelEnabled ? (
                      <>
                        <div className="text-xl font-bold text-white">${plan.price + 20}</div>
                        <div className="text-xs text-gray-400">/ month</div>
                      </>
                    ) : plan.name === 'Premium' && selectedPlan === `${planType}-${plan.name}` ? (
                      <>
                        <div className="text-xl font-bold text-white">${plan.price}</div>
                        <div className="text-xs text-gray-400">/ month</div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl font-bold text-white">${plan.price}</div>
                        <div className="text-xs text-gray-400">/ month</div>
                      </>
                    )}
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

                {/* Telegram channel toggle - только для Premium */}
                {plan.name === 'Premium' && selectedPlan === `${planType}-${plan.name}` && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <label 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTelegramChannelToggle(e)
                      }}
                    >
                      <div className="flex items-center">
                        <span className="text-xs text-gray-300">
                          Telegram channel with orders and custom results
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={telegramChannelEnabled}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleTelegramChannelChange(e)
                          }}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors ${
                          telegramChannelEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                        }`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            telegramChannelEnabled ? 'translate-x-5' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </div>
                    </label>
                  </div>
                )}

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
                    {plan.name === 'Premium' && selectedPlan === `${planType}-${plan.name}` && telegramChannelEnabled ? (
                      <p className="text-sm text-green-400">
                        Save ${420 - 380}
                      </p>
                    ) : plan.name === 'Premium' && selectedPlan === `${planType}-${plan.name}` ? (
                      <p className="text-sm text-green-400">
                        Save ${plan.originalPrice - plan.price}
                      </p>
                    ) : (
                      <p className="text-sm text-green-400">
                        Save ${plan.originalPrice - plan.price}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {plan.name === 'Premium' && selectedPlan === `${planType}-${plan.name}` && telegramChannelEnabled ? (
                      <>
                        <div className="text-xl font-bold text-white">$380</div>
                        <div className="text-xs text-gray-400 line-through">$420</div>
                      </>
                    ) : plan.name === 'Premium' && selectedPlan === `${planType}-${plan.name}` ? (
                      <>
                        <div className="text-xl font-bold text-white">${plan.price}</div>
                        <div className="text-xs text-gray-400 line-through">${plan.originalPrice}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl font-bold text-white">${plan.price}</div>
                        <div className="text-xs text-gray-400 line-through">${plan.originalPrice}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Telegram channel toggle - только для Premium */}
                {plan.name === 'Premium' && selectedPlan === `${planType}-${plan.name}` && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <label 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTelegramChannelToggle(e)
                      }}
                    >
                      <div className="flex items-center">
                        <span className="text-xs text-gray-300">
                          Telegram channel with orders and custom results
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={telegramChannelEnabled}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleTelegramChannelChange(e)
                          }}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors ${
                          telegramChannelEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                        }`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            telegramChannelEnabled ? 'translate-x-5' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </div>
                    </label>
                  </div>
                )}

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
          <p style={{ color: 'rgba(115, 143, 191, 1)' }}>• Automatic subscription renewal</p>

        </div>
      </div>
    </motion.div>
  )
}
