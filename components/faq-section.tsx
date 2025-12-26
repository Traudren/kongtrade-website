
'use client'

import { motion } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    question: 'How does KongTrade work?',
    answer: 'KongTrade uses advanced AI algorithms to analyze market trends and execute trades automatically on your behalf. Our bot connects to your exchange account via secure API keys and trades based on proven strategies, just like King Kong dominates with strength and intelligence.'
  },
  {
    question: 'Which exchanges are supported?',
    answer: 'Currently, KongTrade supports Binance and Bybit exchanges. We chose these platforms for their reliability, liquidity, and robust API systems. More exchanges will be added based on user demand.'
  },
  {
    question: 'Is my money safe?',
    answer: 'Your funds never leave your exchange account. KongTrade only executes trades through secure API connections with read-only access to your balance and trade-only permissions. We cannot withdraw or transfer your funds. IMPORTANT: When creating your API keys on the exchange, make sure to disable the "Withdraw" permission to ensure maximum security of your funds.'
  },
  {
    question: 'Can I customize trading strategies?',
    answer: 'Yes! Different subscription plans offer various levels of customization. Premium users get access to advanced strategy settings, risk parameters, and even custom strategy development with our team.'
  },
  {
    question: 'What\'s the minimum deposit required?',
    answer: 'The minimum deposit depends on your chosen exchange and trading pair. We recommend starting with at least $500-1000 for optimal performance, but you can start with smaller amounts to test the system.'
  },
  {
    question: 'How do I track my bot\'s performance?',
    answer: 'Your dashboard provides real-time performance metrics, trade history, profit/loss tracking, and detailed analytics. You can monitor your bot\'s activity 24/7 through our user-friendly interface.'
  },
  {
    question: 'Can I stop the bot anytime?',
    answer: 'Absolutely! You have complete control over your bot. You can pause, stop, or modify its settings anytime through your dashboard. The bot will immediately halt all trading activities when stopped.'
  },
  {
    question: 'What about the money-back guarantee?',
    answer: 'We offer a 30-day money-back guarantee, but only if the bot hasn\'t been launched yet. Once you activate trading, the guarantee period ends as we\'ve provided the service as promised.'
  }
]

export function FAQSection() {
  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-dm-sans">
            Frequently Asked
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-glow">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-300 font-dm-sans">
            Everything you need to know about KongTrade
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="glass-effect rounded-2xl p-8 card-glow glow-light-blue"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-white/20 bg-white/5 rounded-lg px-6"
              >
                <AccordionTrigger className="text-white hover:text-cyan-400 text-left py-6 font-dm-sans">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6 leading-relaxed font-dm-sans">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
