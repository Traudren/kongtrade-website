
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
              Política de Confidencialidade
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-6">
                Última atualização: Janeiro 2025
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Информация, которую мы собираем</h2>
                <p className="text-gray-300 mb-4">
                  KongTrade собирает минимально необходимую информацию для предоставления наших услуг:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Адрес электронной почты для регистрации и связи</li>
                  <li>Никнейм для идентификации аккаунта</li>
                  <li>Информация о подписке и платежах</li>
                  <li>Логи использования для улучшения сервиса</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. Как мы используем информацию</h2>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Предоставление доступа к торговому боту</li>
                  <li>Обработка платежей и управление подписками</li>
                  <li>Техническая поддержка клиентов</li>
                  <li>Улучшение наших услуг</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Безопасность данных</h2>
                <p className="text-gray-300 mb-4">
                  Мы используем современные методы шифрования и защиты для обеспечения безопасности ваших данных. 
                  API ключи хранятся в зашифрованном виде и используются только для торговых операций.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Контакты</h2>
                <p className="text-gray-300">
                  По вопросам политики конфиденциальности обращайтесь: 
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
