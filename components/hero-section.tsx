

'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden hero-glow">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Automated
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-glow">
                Crypto Trading
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
              KongTrade is a powerful automated cryptocurrency trading bot. 
              Helps traders automate trading processes, minimize risks, and maximize efficiency.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 px-2 sm:px-0">
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

          {/* Right content - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
          >
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="glass-effect rounded-xl p-6 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">75%</div>
              <div className="text-sm sm:text-base text-gray-300 mt-1">Prediction Accuracy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="glass-effect rounded-xl p-6 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-green-400">+40%</div>
              <div className="text-sm sm:text-base text-gray-300 mt-1">Average Profit</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

