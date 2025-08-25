
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { motion } from 'framer-motion'
import { Wallet, Copy, Check, AlertCircle, Settings } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'

interface PaymentSectionProps {
  selectedPlan?: { name: string; type: string; price: number }
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
  const [acceptedRisks, setAcceptedRisks] = useState(false)
  
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useTranslation()

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

    if (!txid.trim() || !paymentMethod || selectedAmount === 0) {
      alert('Please fill in all required fields')
      return
    }

    if (!acceptedRisks) {
      alert('Вы должны принять риски и правила использования бота перед оплатой')
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
        alert('Payment submitted for verification! We will contact you shortly.')
        setTxid('')
        // Don't redirect, just show success
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Failed to submit payment'}`)
      }
    } catch (error) {
      console.error('Payment submission error:', error)
      alert('Error submitting payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="pricing" className="py-16 px-4">
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

          {/* Amount selection */}
          <div className="mb-8">
            <Label className="text-white mb-4 block text-lg">
              {selectedPlan?.price ? 'Selected Plan Amount:' : t('chooseAmount')}
            </Label>
            
            {selectedPlan?.price ? (
              <div className="p-4 rounded-lg border border-cyan-400 bg-cyan-400/10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    ${selectedPlan.price}
                  </div>
                  <p className="text-cyan-400">
                    {selectedPlan.name} Plan ({selectedPlan.type})
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[50, 80, 120, 135, 215, 320].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedAmount(amount)
                    }}
                    className={`p-4 rounded-lg border transition-all hover-glow ${
                      selectedAmount === amount
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                    }`}
                  >
                    <div className="text-2xl font-bold">${amount}</div>
                    <div className="text-xs text-gray-400">
                      {amount <= 120 ? 'Monthly' : '3 months'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Payment method selection */}
              <div className="mb-8">
                <Label className="text-white mb-4 block text-lg">{t('selectPaymentMethod')}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                    <SelectValue placeholder="Select wallet type" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/20 rounded-xl">
                    <SelectItem value="binance" className="text-white rounded-lg">{t('binanceWallet')}</SelectItem>
                    <SelectItem value="bybit" className="text-white rounded-lg">{t('bybitWallet')}</SelectItem>
                  </SelectContent>
                </Select>
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

                    {/* Risk and Rules Agreement */}
                    <div className="space-y-4">
                      <div className="p-6 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <div className="mb-4">
                          <h4 className="font-semibold text-yellow-400 mb-3 text-lg flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Правила использования торгового бота
                          </h4>
                          <div className="text-sm text-gray-300 space-y-2">
                            <div className="space-y-2">
                              <p><strong>• Безопасность депозита:</strong> Не используйте свой депозит, выделенный для бота, в других целях</p>
                              <p><strong>• Соблюдение правил:</strong> Строго следуйте инструкциям и setupм бота</p>
                              <p><strong>• Responseственность за риски:</strong> Вы несете полную responseственность за торговые решения и возможные убытки</p>
                              <p><strong>• Блокировка за нарушения:</strong> Умышленное нарушение правил карается немедленной блокировкой без возврата средств</p>
                              <p><strong>• Конфиденциальность:</strong> Запрещена передача конфигурационных файлов третьим лицам</p>
                              <p><strong>• Мониторинг активности:</strong> Все операции логируются и отслеживаются системой безопасности</p>
                              <p><strong>• Техническая поддержка:</strong> Обращения рассматриваются только при соблюдении всех правил</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 mt-6">
                          <Checkbox
                            id="accept-risks"
                            checked={acceptedRisks}
                            onCheckedChange={(checked) => setAcceptedRisks(checked === true)}
                            className="mt-1 border-yellow-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                          />
                          <Label 
                            htmlFor="accept-risks" 
                            className="text-sm text-gray-300 leading-relaxed cursor-pointer"
                          >
                            <span className="font-semibold text-white">Я принимаю риски</span> и соглашаюсь соблюдать все правила использования торгового бота. 
                            Понимаю, что нарушение правил приведет к блокировке доступа без возврата средств.
                          </Label>
                        </div>
                      </div>
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
                        disabled={!txid.trim() || !acceptedRisks || submitting}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-4 text-lg hover-glow disabled:opacity-50 rounded-xl"
                      >
                        {submitting ? 'Submitting...' : t('proceedPayment')}
                      </Button>
                    )}
                  </form>
                </>
              )}
            </motion.div>
          )}

          {selectedAmount === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Select a plan or amount to continue with payment
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
