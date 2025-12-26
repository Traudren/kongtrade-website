
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Bot, Play, Square, AlertCircle, CheckCircle, Zap, Settings, Save, ChevronDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TradingConfig {
  id: string
  exchange: string
  isActive: boolean
  botStatus: string
  lastActivity?: string
  createdAt: string
  updatedAt: string
}

export function TradingConfigSection() {
  const [configs, setConfigs] = useState<TradingConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Form state
  const [exchange, setExchange] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [tgToken, setTgToken] = useState('')
  const [adminId, setAdminId] = useState('5351584188')
  const [exchangeDropdownOpen, setExchangeDropdownOpen] = useState(false)
  const exchangeDropdownRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)

  useEffect(() => {
    fetchConfigs()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exchangeDropdownRef.current && !exchangeDropdownRef.current.contains(e.target as Node)) {
        setExchangeDropdownOpen(false)
      }
    }

    if (exchangeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [exchangeDropdownOpen])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/trading-config')
      if (response.ok) {
        const data = await response.json()
        setConfigs(data.configs || [])
      } else {
        throw new Error('Failed to fetch configs')
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить конфигурации",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!exchange || !apiKey || !apiSecret) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/trading-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchange,
          apiKey,
          apiSecret,
          tgToken,
          adminId
        }),
      })

      if (response.ok) {
        toast({
          title: "Успешно!",
          description: "Конфигурация сохранена и файл создан",
        })
        
        // Очищаем форму
        setExchange('')
        setApiKey('')
        setApiSecret('')
        setTgToken('')
        
        // Обновляем список конфигураций
        fetchConfigs()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save config')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить конфигурацию",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getBotStatusBadge = (status: string) => {
    const statusMap = {
      not_launched: { color: 'bg-gray-500/20 text-gray-400', text: 'Не запущен', icon: AlertCircle },
      running: { color: 'bg-green-500/20 text-green-400', text: 'Работает', icon: Play },
      stopped: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Остановлен', icon: Square },
      error: { color: 'bg-red-500/20 text-red-400', text: 'Ошибка', icon: AlertCircle },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.not_launched
    const IconComponent = statusInfo.icon
    return (
      <Badge className={statusInfo.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {statusInfo.text}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Trading Configuration
          </CardTitle>
          <CardDescription className="text-gray-300">
            Настройте API ключи биржи и параметры торгового бота
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exchange Selection */}
              <div className="space-y-2">
                <Label htmlFor="exchange" className="text-white">Биржа *</Label>
                <div className="relative" ref={exchangeDropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      scrollPositionRef.current = window.scrollY
                      setExchangeDropdownOpen(!exchangeDropdownOpen)
                      requestAnimationFrame(() => {
                        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
                      })
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      scrollPositionRef.current = window.scrollY
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
                  >
                    <span className="block truncate flex items-center">
                      {exchange === 'binance' ? (
                        <>
                          <Image src="/binance-logo.svg" alt="Binance" width={20} height={20} className="mr-2 flex-shrink-0" />
                          Binance
                        </>
                      ) : exchange === 'bybit' ? (
                        <>
                          <Image src="/bybit-logo.svg" alt="Bybit" width={20} height={20} className="mr-2 flex-shrink-0" />
                          Bybit
                        </>
                      ) : (
                        'Выберите биржу'
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  {exchangeDropdownOpen && (
                    <div
                      className="absolute top-full left-0 right-0 z-[100] mt-1 w-full rounded-xl border border-white/20 bg-black/90 backdrop-blur-lg shadow-lg"
                      style={{ position: 'absolute' }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <div className="p-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setExchange('binance')
                            setExchangeDropdownOpen(false)
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Image src="/binance-logo.svg" alt="Binance" width={20} height={20} className="mr-2 flex-shrink-0" />
                          <span>Binance</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setExchange('bybit')
                            setExchangeDropdownOpen(false)
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Image src="/bybit-logo.svg" alt="Bybit" width={20} height={20} className="mr-2 flex-shrink-0" />
                          <span>Bybit</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin ID */}
              <div className="space-y-2">
                <Label htmlFor="adminId" className="text-white">Admin Telegram ID</Label>
                <Input
                  id="adminId"
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                  placeholder="5351584188"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-white">API Key *</Label>
                <Input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                  placeholder="Введите API ключ от биржи"
                  required
                />
              </div>

              {/* API Secret */}
              <div className="space-y-2">
                <Label htmlFor="apiSecret" className="text-white">API Secret *</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                  placeholder="Введите API секрет"
                  required
                />
              </div>
            </div>

            {/* Telegram Token */}
            <div className="space-y-2">
              <Label htmlFor="tgToken" className="text-white">Telegram Bot Token</Label>
              <Input
                id="tgToken"
                type="text"
                value={tgToken}
                onChange={(e) => setTgToken(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                placeholder="Введите токен Telegram бота для сигналов"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || !exchange || !apiKey || !apiSecret}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить конфигурацию
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Configurations */}
      {configs.length > 0 && (
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              Ваши конфигурации
            </CardTitle>
            <CardDescription className="text-gray-300">
              Список активных торговых конфигураций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium capitalize mb-2">{config.exchange}</h3>
                      <div className="flex items-center space-x-4">
                        {getBotStatusBadge(config.botStatus)}
                        {config.isActive && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Активна
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        Создана: {new Date(config.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                      {config.lastActivity && (
                        <p className="text-gray-400 text-sm">
                          Последняя активность: {new Date(config.lastActivity).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration File Info */}
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-400" />
            Информация о конфигурационном файле
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/20 rounded-lg p-4 text-gray-300">
            <p className="mb-2">При сохранении конфигурации автоматически создается файл с вашими данными в формате:</p>
            <pre className="text-sm bg-black/40 p-3 rounded mt-2 overflow-x-auto">
{`# апи ключи от биржи Байбит или Бинанс.
api_key = 'ваш_api_ключ'
api_secret = 'ваш_api_секрет'

# Токены телеграмм бота, в которых будут сигналы.
tg_token_main = "ваш_telegram_токен"

# id аккаунта на который будет приходить сообщение от ботов 
admin_id = "5351584188"`}
            </pre>
            <p className="mt-3 text-yellow-400 text-sm">
              💡 Этот файл будет автоматически использоваться торговым ботом для подключения к бирже и отправки уведомлений.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
