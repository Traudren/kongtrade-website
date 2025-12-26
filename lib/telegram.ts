
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

  constructor(exchange?: string) {
    // Для Bybit используем старый токен, для Binance - новый
    if (exchange === 'binance') {
      this.token = '8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0'
      this.adminId = '5351584188'
    } else {
      // По умолчанию для Bybit
    this.token = '7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc'
    this.adminId = '5351584188'
    }
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
      // Биржа из конфигурации пользователя (где он указал свои API ключи)
      const exchangeFromConfig = userConfig?.exchange || 'bybit'
      
      const message = `🔔 <b>New Payment!</b>

👤 <b>User:</b> ${user.name || 'Not specified'} (${user.email})
💎 <b>Subscription:</b> ${subscription.planName}
⏰ <b>Period:</b> ${subscription.planType === 'monthly' ? '1 month' : '3 months'}
💰 <b>Amount:</b> $${payment.amount}
🏦 <b>Exchange:</b> ${exchangeFromConfig}
🆔 <b>TXID:</b> ${payment.txid || 'Not specified'}

📄 Configuration file attached`

      // Определяем profit_limit на основе плана
      let profitLimit = ''
      if (subscription.planName === 'Basic') {
        profitLimit = '25' // up to 25% of deposit
      } else if (subscription.planName === 'Professional') {
        profitLimit = '40' // up to 40% of deposit
      } else if (subscription.planName === 'Premium') {
        profitLimit = 'unlim' // unlimited
      } else {
        profitLimit = '25' // default
      }

      // Determine subscription period
      const subPeriod = subscription.planType === 'monthly' ? '30 days' : '90 days'

      // Создаем правильный формат конфигурационного файла
      const configContent = `user_name = '${user.name || 'NOT_PROVIDED'}'
api_key = '${userConfig?.apiKey || 'NOT_PROVIDED'}'
api_secret = '${userConfig?.apiSecret || 'NOT_PROVIDED'}'
profit_limit = '${profitLimit}'
sub_period = '${subPeriod}'`

      const filename = `${user.name || user.email.split('@')[0]}_config.txt`
      
      return await this.sendDocument(message, filename, configContent)
    } catch (error) {
      console.error('Error notifying new payment:', error)
      return false
    }
  }
}
