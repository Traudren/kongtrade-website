
interface ConfigData {
  apiKey?: string
  apiSecret?: string
  userName?: string
  profitLimit?: string
  subPeriod?: string
}

export function generateConfigFile(userData: ConfigData): string {
  return `user_name = '${userData.userName || ''}'
api_key = '${userData.apiKey || ''}'
api_secret = '${userData.apiSecret || ''}'
profit_limit = '${userData.profitLimit || ''}'
sub_period = '${userData.subPeriod || ''}'
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
