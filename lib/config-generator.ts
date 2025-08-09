
interface ConfigData {
  apiKey?: string
  apiSecret?: string
  tgToken?: string
  adminId?: string
}

export function generateConfigFile(userData: ConfigData): string {
  return `# апи ключи от биржи Байбит или Бинанс.
api_key = '${userData.apiKey || 'не указан'}'
api_secret = '${userData.apiSecret || 'не указан'}'

# Токены телеграмм бота, в которых будут сигналы.
tg_token_main = "${userData.tgToken || 'не указан'}"

# id аккаунта на который будет приходить сообщение от ботов 
admin_id = "${userData.adminId || '5351584188'}"
`
}

export async function saveConfigToFile(userId: string, configData: ConfigData): Promise<string> {
  const fs = require('fs').promises
  const path = require('path')
  
  try {
    const configContent = generateConfigFile(configData)
    const configDir = path.join(process.cwd(), 'user-configs')
    
    // Создаем директорию если не существует
    try {
      await fs.mkdir(configDir, { recursive: true })
    } catch (error) {
      // Директория уже существует
    }
    
    const configPath = path.join(configDir, `${userId}.txt`)
    await fs.writeFile(configPath, configContent, 'utf8')
    
    return configPath
  } catch (error) {
    console.error('Error saving config file:', error)
    throw error
  }
}
