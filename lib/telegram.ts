
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
  private lastRequestTime: number = 0
  private readonly minDelayBetweenRequests: number = 1000 // 1 секунда между запросами

  constructor(exchange?: string) {
    // Для Bybit используем новый токен, для Binance - старый
    if (exchange === 'binance') {
      this.token = '8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0'
      this.adminId = '5351584188'
    } else {
      // По умолчанию для Bybit - новый токен
      this.token = '8419770498:AAH_Kqf_70_NCZ5OBhwr5lYiSdEhGkm8bG0'
      this.adminId = '5351584188'
    }
  }

  // Rate limiting: задержка между запросами
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.minDelayBetweenRequests) {
      const waitTime = this.minDelayBetweenRequests - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequestTime = Date.now()
  }

  // Обработка ошибок API Telegram с повторными попытками
  private async handleApiRequest<T>(
    requestFn: () => Promise<Response>,
    maxRetries: number = 3
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    let lastError: string | undefined
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Rate limiting перед каждым запросом
        await this.waitForRateLimit()
        
        const response = await requestFn()
        
        // Обработка 429 (Too Many Requests)
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const waitTime = retryAfter 
            ? parseInt(retryAfter) * 1000 
            : Math.min(1000 * Math.pow(2, attempt), 60000) // Exponential backoff, максимум 60 секунд
          
          console.warn(`⚠️ Rate limit hit (429). Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`)
          
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, waitTime))
            continue
          }
          
          return { success: false, error: 'Rate limit exceeded. Please try again later.' }
        }
        
        // Обработка других ошибок
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorDescription = errorData.description || `HTTP ${response.status}`
          
          console.error(`❌ Telegram API error (${response.status}):`, errorDescription)
          
          // Для некоторых ошибок не стоит повторять попытку
          if (response.status === 400 || response.status === 401 || response.status === 403) {
            return { success: false, error: errorDescription }
          }
          
          // Для других ошибок повторяем попытку
          if (attempt < maxRetries - 1) {
            const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000) // Exponential backoff, максимум 10 секунд
            console.warn(`⚠️ Retrying after ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            continue
          }
          
          return { success: false, error: errorDescription }
        }
        
        // Успешный ответ
        const data = await response.json()
        return { success: true, data }
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        console.error(`❌ Telegram API request error (attempt ${attempt + 1}/${maxRetries}):`, lastError)
        
        if (attempt < maxRetries - 1) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }
    
    return { success: false, error: lastError || 'Unknown error after retries' }
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

      const result = await this.handleApiRequest<any>(() =>
        fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
      )

      if (result.success && result.data) {
        return { success: true, messageId: result.data.result?.message_id }
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

      const result = await this.handleApiRequest(() =>
        fetch(`https://api.telegram.org/bot${this.token}/editMessageText`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
      )

      return result.success || false
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

      const result = await this.handleApiRequest(() =>
        fetch(`https://api.telegram.org/bot${this.token}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
      )

      return result.success || false
    } catch (error) {
      console.error('Telegram edit message reply markup error:', error)
      return false
    }
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<boolean> {
    try {
      const result = await this.handleApiRequest(() =>
        fetch(`https://api.telegram.org/bot${this.token}/answerCallbackQuery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: text || 'Processing...',
          }),
        })
      )

      return result.success || false
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

      const result = await this.handleApiRequest<any>(() =>
        fetch(`https://api.telegram.org/bot${this.token}/sendDocument`, {
          method: 'POST',
          body: formData,
        })
      )

      if (result.success && result.data) {
        return { success: true, messageId: result.data.result?.message_id }
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
