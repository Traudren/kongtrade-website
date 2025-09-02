
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      alert('Будь ласка, введіть email адресу')
      return
    }
    
    // Mock submission
    console.log('Password reset request for:', email)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mb-6">
              <Image
                src="https://cdn.abacus.ai/images/b7c4089b-59d3-4cdc-9d72-bca87e0768c3.png"
                alt="KongTrade"
                width={200}
                height={60}
                className="mx-auto"
              />
            </div>
            
            {!isSubmitted ? (
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Відновлення пароля</h1>
                <p className="text-gray-300">
                  Введіть свою електронну пошту для відновлення доступу
                </p>
              </div>
            ) : (
              <div>
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Лист відправлено</h1>
                <p className="text-gray-300">
                  Перевірте свою електронну пошту для подальших інструкцій
                </p>
              </div>
            )}
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Електронна пошта"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover-glow"
              >
                Відправити лист для відновлення
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-400 text-center">
                  Лист з інструкціями відправлено на <strong>{email}</strong>
                </p>
              </div>
              
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Відправити ще раз
              </Button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Повернутися до входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
