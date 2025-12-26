
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-6">
                Last updated: January 2025
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                <p className="text-gray-300 mb-4">
                  KongTrade collects the minimum necessary information to provide our services:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Email address for registration and communication</li>
                  <li>Username for account identification</li>
                  <li>Subscription and payment information</li>
                  <li>Usage logs for service improvement</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Information</h2>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Providing access to the trading bot</li>
                  <li>Processing payments and managing subscriptions</li>
                  <li>Customer technical support</li>
                  <li>Improving our services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
                <p className="text-gray-300 mb-4">
                  We use modern encryption and protection methods to ensure the security of your data. 
                  API keys are stored in encrypted form and used only for trading operations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Contact</h2>
                <p className="text-gray-300">
                  For privacy policy inquiries, please contact: 
                  <a href="mailto:privacy@kongtrade.com" className="text-cyan-400 hover:text-cyan-300 ml-1">
                    privacy@kongtrade.com
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
