

'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-16 px-4 overflow-hidden hero-glow">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Automated
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-glow">
                Crypto Trading
              </span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              KongTrade is a powerful automated cryptocurrency trading bot. 
              Helps traders automate trading processes, minimize risks, and maximize efficiency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 text-base hover-glow"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Start Trading
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-6 py-3 text-base"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center lg:text-left"
              >
                <TrendingUp className="h-7 w-7 text-cyan-400 mb-3 mx-auto lg:mx-0" />
                <h3 className="font-semibold text-white mb-2 text-base">High Returns</h3>
                <p className="text-gray-400 text-sm">Up to 50% of deposit</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center lg:text-left"
              >
                <Shield className="h-7 w-7 text-cyan-400 mb-3 mx-auto lg:mx-0" />
                <h3 className="font-semibold text-white mb-2 text-base">Security</h3>
                <p className="text-gray-400 text-sm">Risk minimization</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center lg:text-left"
              >
                <Zap className="h-7 w-7 text-cyan-400 mb-3 mx-auto lg:mx-0" />
                <h3 className="font-semibold text-white mb-2 text-base">Automation</h3>
                <p className="text-gray-400 text-sm">24/7 trading</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden glass-effect p-4">
              <Image
                src="https://cdn.abacus.ai/images/51017a31-4f90-432a-9fb5-cae6bdcfe52c.png"
                alt="KongTrade King Kong Trading Platform"
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
            </div>
            
            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -bottom-6 -left-6 glass-effect rounded-xl p-4"
            >
              <div className="text-xl font-bold text-cyan-400">75%</div>
              <div className="text-sm text-gray-300">Prediction Accuracy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -top-6 -right-6 glass-effect rounded-xl p-4"
            >
              <div className="text-xl font-bold text-green-400">+40%</div>
              <div className="text-sm text-gray-300">Average Profit</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

