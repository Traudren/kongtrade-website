
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
              Условия использования
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-6">
                Последнее обновление: Январь 2025
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Принятие условий</h2>
                <p className="text-gray-300 mb-4">
                  Используя услуги KongTrade, вы соглашаетесь с данными условиями использования. 
                  Если вы не согласны с условиями, пожалуйста, не используйте наш сервис.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. Описание услуг</h2>
                <p className="text-gray-300 mb-4">
                  KongTrade предоставляет автоматизированные решения для торговли криптовалютами. 
                  Наш бот выполняет торговые операции на основе алгоритмов машинного обучения.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Риски и ответственность</h2>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Торговля криптовалютами связана с высокими рисками</li>
                  <li>Прошлые результаты не гарантируют будущие прибыли</li>
                  <li>Пользователь несет полную ответственность за торговые решения</li>
                  <li>KongTrade не гарантирует прибыльность торговых операций</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Оплата и возврат средств</h2>
                <p className="text-gray-300 mb-4">
                  Подписки оплачиваются заранее. Возврат средств возможен в течение 30 дней 
                  с момента первой покупки при соблюдении условий возврата.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Контакты</h2>
                <p className="text-gray-300">
                  По вопросам условий использования обращайтесь: 
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
