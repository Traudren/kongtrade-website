
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-6">
                Last updated: January 2025
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-300 mb-4">
                  By using KongTrade services, you agree to these terms of use. 
                  If you do not agree with the terms, please do not use our service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
                <p className="text-gray-300 mb-4">
                  KongTrade provides automated solutions for cryptocurrency trading. 
                  Our bot executes trading operations based on machine learning algorithms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Risks and Responsibility</h2>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Cryptocurrency trading involves high risks</li>
                  <li>Past results do not guarantee future profits</li>
                  <li>Users bear full responsibility for trading decisions</li>
                  <li>KongTrade does not guarantee profitability of trading operations</li>
                  <li className="font-semibold text-yellow-400 border-l-4 border-yellow-400 pl-4 ml-2">
                    <strong>IMPORTANT:</strong> Follow all bot usage rules strictly. 
                    In case of rule violations, the bot will be disabled for security purposes
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Payment and Refunds</h2>
                <p className="text-gray-300 mb-4">
                  Subscriptions are paid in advance. Refunds are possible within 30 days 
                  from the first purchase, subject to refund conditions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Contact</h2>
                <p className="text-gray-300">
                  For terms of service questions, contact: 
                  <a href="mailto:legal@kongtrade.com" className="text-cyan-400 hover:text-cyan-300 ml-1">
                    legal@kongtrade.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
