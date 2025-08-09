
interface TelegramMessage {
  chat_id: string
  text: string
  parse_mode?: string
  document?: {
    filename: string
    content: string
  }
}

export class TelegramBot {
  private token: string
  private adminId: string

  constructor() {
    this.token = '7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc'
    this.adminId = '5351584188'
  }

  async sendMessage(text: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.adminId,
          text: text,
          parse_mode: 'HTML',
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Telegram send message error:', error)
      return false
    }
  }

  async sendDocument(text: string, filename: string, fileContent: string): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append('chat_id', this.adminId)
      formData.append('caption', text)
      formData.append('parse_mode', 'HTML')
      
      // Создаем файл Blob
      const blob = new Blob([fileContent], { type: 'text/plain' })
      formData.append('document', blob, filename)

      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendDocument`, {
        method: 'POST',
        body: formData,
      })

      return response.ok
    } catch (error) {
      console.error('Telegram send document error:', error)
      return false
    }
  }

  async notifyNewPayment(user: any, subscription: any, payment: any, userConfig: any): Promise<boolean> {
    try {
      const message = `🔔 <b>Новый платеж!</b>

👤 <b>Пользователь:</b> ${user.name || 'Не указано'} (${user.email})
💎 <b>Подписка:</b> ${subscription.planName}
⏰ <b>Период:</b> ${subscription.planType === 'monthly' ? '1 месяц' : '3 месяца'}
💰 <b>Сумма:</b> $${payment.amount}
🏦 <b>Биржа:</b> ${payment.paymentMethod}
🆔 <b>TXID:</b> ${payment.txid || 'Не указан'}

📄 Конфигурационный файл приложен`

      // Создаем правильный формат конфигурационного файла
      const configContent = `# апи ключи от биржи ${userConfig?.exchange === 'binance' ? 'Бинанс' : 'Байбит'}.
api_key = '${userConfig?.apiKey || 'NOT_PROVIDED'}'
api_secret = '${userConfig?.apiSecret || 'NOT_PROVIDED'}'

# Токены телеграмм бота, в которых будут сигналы.
tg_token_main = "${userConfig?.telegramToken || '8159634915:AAGLifkNfMasdDS425iws0t8Lj0kdpVgG-IdKFNB54'}"

# id аккаунта на который будет приходить сообщение от ботов
admin_id = "${userConfig?.adminId || '535472846578'}"`

      const filename = `${user.name || user.email.split('@')[0]}_config.txt`
      
      return await this.sendDocument(message, filename, configContent)
    } catch (error) {
      console.error('Error notifying new payment:', error)
      return false
    }
  }
}
