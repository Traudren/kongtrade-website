
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Settings, Copy, Check, Eye, EyeOff } from 'lucide-react'

const configTemplate = {
  binance: `{
  "exchange": "binance",
  "apiKey": "your_api_key_here",
  "apiSecret": "your_api_secret_here",
  "sandbox": false,
  "strategy": {
    "type": "grid_trading",
    "stopLoss": 0.05,
    "takeProfit": 0.15,
    "gridSpacing": 0.02
  },
  "riskManagement": {
    "maxPositionSize": 0.1,
    "dailyLossLimit": 0.03
  }
}`,
  bybit: `{
  "exchange": "bybit",
  "apiKey": "your_api_key_here",
  "apiSecret": "your_api_secret_here",
  "testnet": false,
  "strategy": {
    "type": "momentum_trading",
    "stopLoss": 0.04,
    "takeProfit": 0.12,
    "rsiPeriod": 14
  },
  "riskManagement": {
    "maxPositionSize": 0.08,
    "dailyLossLimit": 0.025
  }
}`
}

export function ConfigSection() {
  const [selectedExchange, setSelectedExchange] = useState<string>('binance')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyConfig = () => {
    if (selectedExchange) {
      navigator.clipboard.writeText(configTemplate[selectedExchange as keyof typeof configTemplate])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="flex-1"
    >
      <div className="glass-effect rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
          Trading Configuration
        </h2>

        <div className="space-y-6">
          {/* Exchange Selection */}
          <div className="space-y-2">
            <Label className="text-white">Select Exchange</Label>
            <Select value={selectedExchange} onValueChange={setSelectedExchange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose your exchange" />
              </SelectTrigger>
              <SelectContent className="glass-effect border-white/20">
                <SelectItem value="binance" className="text-white">Binance</SelectItem>
                <SelectItem value="bybit" className="text-white">Bybit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Credentials */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">API Key</Label>
              <Input
                type="text"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">API Secret</Label>
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter your API secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Preview */}
          {selectedExchange && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <Label className="text-white">Configuration Preview</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyConfig}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Config
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                  {configTemplate[selectedExchange as keyof typeof configTemplate]}
                </pre>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-start">
                  <Settings className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-blue-400 mb-2">Configuration Notes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Replace "your_api_key_here" with your actual API key</li>
                      <li>Replace "your_api_secret_here" with your actual API secret</li>
                      <li>Adjust risk parameters according to your preferences</li>
                      <li>Test with small amounts before full deployment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="text-center text-sm text-gray-400">
            <p>• API keys are stored securely and encrypted</p>
            <p>• Your funds never leave your exchange account</p>
            <p>• You can modify settings anytime after registration</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
