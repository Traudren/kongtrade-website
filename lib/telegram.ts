
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

  async sendMessage(text: string, replyMarkup?: any): Promise<{ success: boolean; messageId?: number }> {
    try {
      const body: any = {
        chat_id: this.adminId,
        text: text,
        parse_mode: 'HTML',
      }

      if (replyMarkup) {
        body.reply_markup = replyMarkup
      }

      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, messageId: data.result?.message_id }
      }

      return { success: false }
    } catch (error) {
      console.error('Telegram send message error:', error)
      return { success: false }
    }
  }

  async editMessageText(messageId: number, text: string, replyMarkup?: any): Promise<boolean> {
    try {
      const body: any = {
        chat_id: this.adminId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
      }

      if (replyMarkup) {
        body.reply_markup = replyMarkup
      }

      const response = await fetch(`https://api.telegram.org/bot${this.token}/editMessageText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      return response.ok
    } catch (error) {
      console.error('Telegram edit message error:', error)
      return false
    }
  }

  async editMessageReplyMarkup(messageId: number, replyMarkup?: any): Promise<boolean> {
    try {
      const body: any = {
        chat_id: this.adminId,
        message_id: messageId,
      }

      if (replyMarkup) {
        body.reply_markup = replyMarkup
      } else {
        // Если replyMarkup не передан, удаляем кнопки (пустой inline_keyboard)
        body.reply_markup = { inline_keyboard: [] }
      }

      const response = await fetch(`https://api.telegram.org/bot${this.token}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      return response.ok
    } catch (error) {
      console.error('Telegram edit message reply markup error:', error)
      return false
    }
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || 'Processing...',
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Telegram answer callback error:', error)
      return false
    }
  }

  async sendDocument(caption: string, filename: string, fileContent: string, replyMarkup?: any): Promise<{ success: boolean; messageId?: number }> {
    try {
      const formData = new FormData()
      formData.append('chat_id', this.adminId)
      formData.append('caption', caption)
      formData.append('parse_mode', 'HTML')
      
      // Создаем файл Blob
      const blob = new Blob([fileContent], { type: 'text/plain' })
      formData.append('document', blob, filename)

      // Добавляем inline_keyboard если есть
      if (replyMarkup) {
        formData.append('reply_markup', JSON.stringify(replyMarkup))
      }

      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendDocument`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, messageId: data.result?.message_id }
      }

      return { success: false }
    } catch (error) {
      console.error('Telegram send document error:', error)
      return { success: false }
    }
  }

  async notifyNewPayment(user: any, subscription: any, payment: any, userConfig: any): Promise<{ success: boolean; messageId?: number }> {
    try {
      // Биржа из конфигурации пользователя (где он указал свои API ключи)
      const exchangeFromConfig = userConfig?.exchange || 'bybit'
      
      const message = `🔔 <b>New Payment Request!</b>

👤 <b>User:</b> ${user.name || 'Not specified'} (${user.email})
💎 <b>Subscription:</b> ${subscription.planName}
⏰ <b>Period:</b> ${subscription.planType === 'monthly' ? '1 month' : '3 months'}
💰 <b>Amount:</b> $${payment.amount}
🏦 <b>Exchange:</b> ${exchangeFromConfig}
🆔 <b>TXID:</b> ${payment.txid || 'Not specified'}
📅 <b>Date:</b> ${new Date(payment.createdAt).toLocaleString()}

⚠️ <b>Please verify the payment and click the button below:</b>`

      // Определяем profit_limit на основе planName
      let profitLimit = 'unlim'
      if (subscription.planName === 'Basic') {
        profitLimit = '25'
      } else if (subscription.planName === 'Professional') {
        profitLimit = '40'
      }

      // Определяем sub_period на основе planType
      const subPeriod = subscription.planType === 'monthly' ? '30' : '90'

      // Создаем содержимое файла .txt
      const fileContent = `nick_name = '${user.name || 'Not specified'}'
api_key = '${userConfig?.apiKey || ''}'
api_secret = '${userConfig?.apiSecret || ''}'
sub_period = '${subPeriod}'
profit_limit = '${profitLimit}'`

      // Создаем inline кнопки
      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '✅ Подтвердить',
              callback_data: `approve_payment_${payment.id}`
            },
            {
              text: '❌ Отменить',
              callback_data: `reject_payment_${payment.id}`
            }
          ]
        ]
      }

      // Отправляем документ с caption и кнопками
      const filename = `config_${payment.id}.txt`
      const result = await this.sendDocument(message, filename, fileContent, replyMarkup)
      return result
    } catch (error) {
      console.error('Error notifying new payment:', error)
      return { success: false }
    }
  }
}
