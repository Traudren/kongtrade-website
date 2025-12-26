
'use client'

import { useState, useEffect, useRef } from 'react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import { Wallet, Copy, Check, AlertCircle, Settings } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface PaymentSectionProps {
  selectedPlan?: { name: string; type: string; price: number; telegramChannel?: boolean }
}

const walletAddresses = {
  binance: "TM7zZgrEuywymYpLbRv37wRdj5vmBNnHTn",
  bybit: "TFw4FEHC7GxHEYEt2R5fCBxhoby3sMSj2Y"
}

export function PaymentSection({ selectedPlan }: PaymentSectionProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [txid, setTxid] = useState('')
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasConfig, setHasConfig] = useState(false)
  const [checkingConfig, setCheckingConfig] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hasPendingPayment, setHasPendingPayment] = useState(false)
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState<number | null>(null)
  const scrollPositionRef = React.useRef<number>(0)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const { toast } = useToast()

  // Сохраняем позицию скролла и предотвращаем нежелательную прокрутку
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Закрываем dropdown при клике вне его
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Update selected amount when plan changes
  useEffect(() => {
    if (selectedPlan?.price) {
      setSelectedAmount(selectedPlan.price)
    }
  }, [selectedPlan])

  // Check if user has configuration
  useEffect(() => {
    const checkUserConfig = async () => {
      if (!session?.user) {
        setCheckingConfig(false)
        return
      }

      try {
        const response = await fetch('/api/trading-config')
        if (response.ok) {
          const data = await response.json()
          setHasConfig(data.configs && data.configs.length > 0)
        }
      } catch (error) {
        console.error('Error checking config:', error)
        setHasConfig(false)
      } finally {
        setCheckingConfig(false)
      }
    }

    checkUserConfig()
  }, [session])

  // Проверяем наличие PENDING платежей
  useEffect(() => {
    const checkPendingPayment = async () => {
      if (!session?.user) {
        setHasPendingPayment(false)
        return
      }

      try {
        const response = await fetch('/api/payments')
        if (response.ok) {
          const data = await response.json()
          const pendingPayment = data.payments?.find((p: any) => p.status === 'PENDING')
          if (pendingPayment) {
            setHasPendingPayment(true)
            setPendingPaymentAmount(pendingPayment.amount)
          } else {
            setHasPendingPayment(false)
            setPendingPaymentAmount(null)
          }
        }
      } catch (error) {
        console.error('Error checking pending payment:', error)
        setHasPendingPayment(false)
      }
    }

    checkPendingPayment()
    // Проверяем каждые 5 секунд, чтобы обновить статус
    const interval = setInterval(checkPendingPayment, 5000)
    return () => clearInterval(interval)
  }, [session])

  const walletAddress = paymentMethod ? walletAddresses[paymentMethod as keyof typeof walletAddresses] : ""

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    if (hasPendingPayment) {
      toast({
        variant: 'destructive',
        title: 'Payment Pending',
        description: 'You have a pending payment. Please wait for the current payment to be processed before creating a new one.',
      })
      return
    }

    if (!txid.trim() || !paymentMethod || !selectedPlan?.price) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
      })
      return
    }
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          paymentMethod,
          walletAddress,
          txid,
          planName: selectedPlan?.name,
          planType: selectedPlan?.type,
        }),
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Payment Submitted',
          description: 'Payment submitted for verification! We will contact you shortly.',
        })
        setTxid('')
        setHasPendingPayment(true) // Обновляем состояние после успешной отправки
        // Don't redirect, just show success
      } else {
        const error = await response.json()
        if (response.status === 409) {
          // Conflict - есть pending платеж
          setHasPendingPayment(true)
          if (error.pendingPaymentAmount) {
            setPendingPaymentAmount(error.pendingPaymentAmount)
          }
        }
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: error.error || error.message || 'Failed to submit payment',
        })
      }
    } catch (error) {
      console.error('Payment submission error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error submitting payment. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="payment" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-effect rounded-2xl p-8 card-glow glow-light-cyan"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Payment
          </h2>

          {/* Pending payment warning */}
          {hasPendingPayment && (
            <div className="mb-8 p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-400">
                    Payment Pending Review
                  </h3>
                  <div className="mt-2 text-sm text-yellow-300">
                    <p>
                      You have a pending payment {pendingPaymentAmount ? `of $${pendingPaymentAmount}` : ''} that is being reviewed.
                      Please wait for the current payment to be processed before creating a new one.
                    </p>
                    <p className="mt-2 text-xs text-yellow-400/80">
                      We'll notify you once your payment is processed. This page will automatically update.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amount selection - только если выбран план */}
          {selectedPlan?.price && (
            <div className={hasPendingPayment ? 'opacity-50 pointer-events-none' : ''}>
          <div className="mb-8">
            <Label className="text-white mb-4 block text-lg">
                  Selected Plan Amount:
            </Label>
              <div className="p-4 rounded-lg border border-cyan-400 bg-cyan-400/10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    ${selectedPlan.price}
                  </div>
                  <p className="text-cyan-400">
                    {selectedPlan.name} Plan ({selectedPlan.type})
                      {selectedPlan.telegramChannel && (
                        <span className="block mt-1 text-xs">
                          + Telegram channel
                        </span>
                      )}
                  </p>
                  </div>
                </div>
              </div>
              </div>
            )}

          {selectedPlan?.price && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={hasPendingPayment ? 'opacity-50 pointer-events-none' : ''}
            >
              {/* Payment method selection */}
              <div className="mb-8">
                <Label className="text-white mb-4 block text-lg">{t('selectPaymentMethod')}</Label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      scrollPositionRef.current = window.scrollY
                      setDropdownOpen(!dropdownOpen)
                      // Восстанавливаем позицию скролла после открытия
                      requestAnimationFrame(() => {
                        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
                      })
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      scrollPositionRef.current = window.scrollY
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="block truncate">
                      {paymentMethod === 'binance' ? t('binanceWallet') : 
                       paymentMethod === 'bybit' ? t('bybitWallet') : 
                       'Select wallet type'}
                    </span>
                    <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full rounded-xl border border-white/20 bg-black/90 backdrop-blur-lg shadow-lg"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <div className="p-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setPaymentMethod('binance')
                            setDropdownOpen(false)
                            requestAnimationFrame(() => {
                              window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
                            })
                          }}
                          className="relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm text-white outline-none hover:bg-white/10 focus:bg-white/10"
                        >
                          {t('binanceWallet')}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setPaymentMethod('bybit')
                            setDropdownOpen(false)
                            requestAnimationFrame(() => {
                              window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
                            })
                          }}
                          className="relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm text-white outline-none hover:bg-white/10 focus:bg-white/10"
                        >
                          {t('bybitWallet')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {paymentMethod && (
                <>
                  {/* Payment details */}
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-xl p-6 mb-8 border border-cyan-500/20">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-white mb-2">
                        ${selectedAmount}
                      </div>
                      <p className="text-gray-300">Amount to pay</p>
                      <p className="text-sm text-cyan-400 capitalize">{paymentMethod} Wallet</p>
                    </div>

                    {/* Wallet address */}
                    <div className="space-y-4">
                      <Label className="text-white flex items-center">
                        <Wallet className="h-5 w-5 mr-2" />
                        Wallet address for payment:
                      </Label>
                      
                      <div className="flex items-center space-x-2 p-4 bg-black/30 rounded-lg">
                        <code className="flex-1 text-yellow-400 text-sm break-all">
                          {walletAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyToClipboard}
                          className="text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {copied && (
                        <p className="text-green-400 text-sm">
                          ✓ Address copied to clipboard
                        </p>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-300">
                          <p className="font-semibold text-blue-400 mb-2">Payment Instructions:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Copy the wallet address above</li>
                            <li>Send exactly ${selectedAmount} to this address</li>
                            <li>After completing the transaction, enter the TXID below</li>
                            <li>Click "Confirm Payment"</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TXID input */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="txid" className="text-white mb-2 block">
                        Transaction ID (TXID):
                      </Label>
                      <Input
                        id="txid"
                        type="text"
                        value={txid}
                        onChange={(e) => setTxid(e.target.value)}
                        placeholder="Enter your transaction ID here"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                        required
                      />
                      <p className="text-sm text-gray-400 mt-2">
                        Enter the Transaction ID you received after sending the funds
                      </p>
                    </div>

                    {!hasConfig ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="flex items-start">
                            <Settings className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-300">
                              <p className="font-semibold text-red-400 mb-2">Configuration Required</p>
                              <p>You must complete your trading configuration before making a payment.</p>
                            </div>
                          </div>
                        </div>
                        <Link href="/dashboard">
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-4 text-lg hover-glow rounded-xl">
                            <Settings className="mr-2 h-5 w-5" />
                            Complete Configuration First
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button
                        type="submit"
                        disabled={!txid.trim() || submitting || hasPendingPayment}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-4 text-lg hover-glow disabled:opacity-50 rounded-xl"
                      >
                        {hasPendingPayment ? 'Payment Pending Review' : submitting ? 'Submitting...' : t('proceedPayment')}
                      </Button>
                    )}
                  </form>
                </>
              )}
            </motion.div>
          )}

          {!selectedPlan?.price && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Select a plan to continue with payment
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
