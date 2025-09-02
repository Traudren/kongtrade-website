
interface ConfigData {
  apiKey?: string
  apiSecret?: string
  tgToken?: string
  adminId?: string
}

export function generateConfigFile(userData: ConfigData): string {
  return `# API keys from Bybit or Binance exchange.
api_key = '${userData.apiKey || 'not specified'}'
api_secret = '${userData.apiSecret || 'not specified'}'

# Telegram bot tokens for signals.
tg_token_main = "${userData.tgToken || 'not specified'}"

# Admin account ID for bot messages 
admin_id = "${userData.adminId || '5351584188'}"
`
}

export async function saveConfigToFile(userId: string, configData: ConfigData): Promise<string> {
  try {
    // В serverless среде не сохраняем файлы локально
    // Возвращаем содержимое файла для скачивания пользователем
    const configContent = generateConfigFile(configData)
    return configContent
  } catch (error) {
    console.error('Error generating config file:', error)
    throw error
  }
}
