
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address',
      })
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
                src="/logo.png"
                alt="KongTrade"
                width={200}
                height={200}
                className="mx-auto h-20 w-20 rounded-lg"
              />
            </div>
            
            {!isSubmitted ? (
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Password Recovery</h1>
                <p className="text-gray-300">
                  Enter your email address to recover access
                </p>
              </div>
            ) : (
              <div>
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Email Sent</h1>
                <p className="text-gray-300">
                  Check your email for further instructions
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
                  placeholder="Email address"
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
                Send Recovery Email
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-400 text-center">
                  Instructions email sent to <strong>{email}</strong>
                </p>
              </div>
              
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Send Again
              </Button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
