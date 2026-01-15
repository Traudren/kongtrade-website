

'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Shield, Zap, TrendingUp, Users, Award, Clock } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Secure Trading',
    description: 'Bank-level security with encrypted API connections and secure fund management.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Execute trades in milliseconds with our optimized algorithms and direct exchange connections.'
  },
  {
    icon: TrendingUp,
    title: 'High Performance',
    description: 'Advanced AI-driven strategies that adapt to market conditions for maximum profitability.'
  },
  {
    icon: Users,
    title: 'Expert Support',
    description: '24/7 dedicated support team with years of trading and technical expertise.'
  },
  {
    icon: Award,
    title: 'Proven Results',
    description: 'Track record of consistent returns with transparent performance metrics.'
  },
  {
    icon: Clock,
    title: '24/7 Trading',
    description: 'Never miss an opportunity with round-the-clock automated trading operations.'
  }
]

export function AboutSection() {
  return (
    <section id="features" className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 text-center lg:text-left">
              Why Choose
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-glow">
                KongTrade?
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed text-center lg:text-left">
              KongTrade combines the power of King Kong with cutting-edge trading technology. 
              Our AI-powered bot dominates the crypto markets with precision and strength, 
              just like the legendary gorilla himself.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-cyan-400 mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-sm">{feature.title}</h3>
                    <p className="text-gray-400 text-xs">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right content - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-effect p-4">
              <Image
                src="https://cdn.abacus.ai/images/0a6ab9c9-7975-4868-8283-ea39fd8ccffb.png"
                alt="King Kong analyzing crypto market data with floating coins"
                fill
                className="object-cover rounded-lg"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
            </div>
            
            {/* Floating achievement cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-4 sm:mt-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="glass-effect rounded-xl p-4 sm:p-6 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-green-400">1K+</div>
                <div className="text-sm sm:text-base text-gray-300 mt-1">Active Traders</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                viewport={{ once: true }}
                className="glass-effect rounded-xl p-4 sm:p-6 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400">$400K+</div>
                <div className="text-sm sm:text-base text-gray-300 mt-1">Trading Volume</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

