
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

  async editMessageCaption(messageId: number, caption: string, replyMarkup?: any): Promise<boolean> {
    try {
      const body: any = {
        chat_id: this.adminId,
        message_id: messageId,
        caption: caption,
        parse_mode: 'HTML',
      }

      // Если replyMarkup не передан, убираем кнопки (передаем пустой объект)
      if (replyMarkup !== undefined) {
        body.reply_markup = replyMarkup
      } else {
        body.reply_markup = { inline_keyboard: [] } // Убираем кнопки
      }

      const response = await fetch(`https://api.telegram.org/bot${this.token}/editMessageCaption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      return response.ok
    } catch (error) {
      console.error('Telegram edit message caption error:', error)
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

  async sendDocument(fileContent: string | Buffer, caption?: string, filename: string = 'user.txt', replyMarkup?: any): Promise<{ success: boolean; messageId?: number }> {
    try {
      console.log('📤 Sending document to Telegram...')
      console.log('File content length:', typeof fileContent === 'string' ? fileContent.length : fileContent.length)
      console.log('Filename:', filename)
      
      // Используем динамический импорт для form-data
      const FormDataModule = await import('form-data')
      const FormData = FormDataModule.default || FormDataModule
      
      const formData = new FormData()
      formData.append('chat_id', this.adminId)
      if (caption) {
        formData.append('caption', caption)
        formData.append('parse_mode', 'HTML')
      }
      
      // Добавляем содержимое файла напрямую из памяти
      const buffer = typeof fileContent === 'string' ? Buffer.from(fileContent, 'utf8') : fileContent
      
      // Используем правильный формат для form-data
      // form-data принимает Buffer с опциями в виде объекта
      formData.append('document', buffer, {
        filename: filename,
        contentType: 'text/plain',
      })

      console.log('📤 FormData created, sending to Telegram API...')
      
      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendDocument`, {
        method: 'POST',
        body: formData as any,
        headers: formData.getHeaders(),
      })

      console.log('📥 Telegram API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Document sent successfully to Telegram, message ID:', data.result?.message_id)
        return { success: true, messageId: data.result?.message_id }
      }

      const errorText = await response.text()
      console.error('❌ Telegram send document error response:', errorText)
      console.error('Response status:', response.status)
      return { success: false }
    } catch (error) {
      console.error('❌ Telegram send document error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      return { success: false }
    }
  }

  async deleteMessage(messageId: number): Promise<boolean> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/deleteMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.adminId,
          message_id: messageId,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Telegram delete message error:', error)
      return false
    }
  }

  async notifyNewPayment(user: any, subscription: any, payment: any, userConfig: any): Promise<{ success: boolean; messageId?: number }> {
    try {
      // Биржа из конфигурации пользователя (где он указал свои API ключи)
      const exchangeFromConfig = userConfig?.exchange || 'bybit'
      
      // Определяем profit_limit на основе плана
      let profitLimit = '25'
      if (subscription.planName === 'Basic') {
        profitLimit = '25'
      } else if (subscription.planName === 'Professional') {
        profitLimit = '40'
      } else if (subscription.planName === 'Premium') {
        profitLimit = 'unlim'
      }

      // Определяем период подписки
      const subPeriod = subscription.planType === 'monthly' ? '30' : '90'

      // Создаем содержимое файла в правильном формате
      const fileContent = `exchange = ${exchangeFromConfig}
api_key = ${userConfig?.apiKey || 'НЕ_УКАЗАН'}
api_secret = ${userConfig?.apiSecret || 'НЕ_УКАЗАН'}
sub_period = ${subPeriod}
profit_limit = ${profitLimit}`

      const caption = `🔔 <b>New Payment Request!</b>

👤 <b>User:</b> ${user.name || 'Not specified'} (${user.email})
💎 <b>Subscription:</b> ${subscription.planName}
⏰ <b>Period:</b> ${subscription.planType === 'monthly' ? '1 month' : '3 months'}
💰 <b>Amount:</b> $${payment.amount}
🏦 <b>Exchange:</b> ${exchangeFromConfig}
🆔 <b>TXID:</b> ${payment.txid || 'Not specified'}
📅 <b>Date:</b> ${new Date(payment.createdAt).toLocaleString()}

⚠️ <b>Please verify the payment and click the button below:</b>`

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

      // Отправляем файл с подписью и кнопками сразу
      const result = await this.sendDocument(fileContent, caption, 'user.txt', replyMarkup)
      return result
    } catch (error) {
      console.error('Error notifying new payment:', error)
      return { success: false }
    }
  }
}
