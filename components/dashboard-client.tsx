
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Settings, 
  CreditCard, 
  Bot, 
  LogOut, 
  Crown, 
  Activity,
  TrendingUp,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface Subscription {
  id: string
  planName: string
  planType: string
  price: number
  status: string
  startDate: string | null
  endDate: string | null
}

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  status: string
  createdAt: string
  txid: string | null
}

interface TradingConfig {
  id: string
  exchange: string
  apiKey: string | null
  apiSecret: string | null
  isActive: boolean
  botStatus: string
  lastActivity: string | null
}

export function DashboardClient() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [configs, setConfigs] = useState<TradingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showApiSecret, setShowApiSecret] = useState(false)
  
  // Form states
  const [exchange, setExchange] = useState('bybit')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [subsRes, paymentsRes, configsRes] = await Promise.all([
        fetch('/api/subscriptions', { cache: 'no-store' }),
        fetch('/api/payments', { cache: 'no-store' }),
        fetch('/api/trading-config', { cache: 'no-store' })
      ])

      if (subsRes.ok) {
        const subsData = await subsRes.json()
        setSubscriptions(subsData.subscriptions || [])
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments || [])
      }

      if (configsRes.ok) {
        const configsData = await configsRes.json()
        setConfigs(configsData.configs || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    fetchDashboardData()
    
    return () => {
      mounted = false
    }
  }, []) // Убираем fetchDashboardData из зависимостей

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/trading-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchange,
          apiKey,
          apiSecret,
        }),
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Configuration Saved',
          description: 'Trading configuration saved successfully!',
        })
        setExchange('bybit')
        setApiKey('')
        setApiSecret('')
        fetchDashboardData()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to save configuration',
        })
      }
    } catch (error) {
      console.error('Config submit error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error saving configuration. Please try again.',
      })
    }
  }

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/trading-config?id=${configId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Configuration Deleted',
          description: 'Configuration deleted successfully!',
        })
        fetchDashboardData()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to delete configuration',
        })
      }
    } catch (error) {
      console.error('Delete config error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error deleting configuration. Please try again.',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Pending' },
      ACTIVE: { color: 'bg-green-500/20 text-green-400', text: 'Active' },
      EXPIRED: { color: 'bg-red-500/20 text-red-400', text: 'Expired' },
      CANCELLED: { color: 'bg-gray-500/20 text-gray-400', text: 'Cancelled' },
      COMPLETED: { color: 'bg-green-500/20 text-green-400', text: 'Completed' },
      FAILED: { color: 'bg-red-500/20 text-red-400', text: 'Failed' },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.PENDING
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
  }

  const activeSubscription = subscriptions.find(sub => sub.status === 'ACTIVE')

  // Мемоизируем активную подписку
  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="KongTrade"
                width={180}
                height={180}
                className="h-12 w-12"
              />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-300">Welcome back, {session?.user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Crown className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-cyan-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Active Plan</p>
                  <p className="text-xl font-bold text-white">
                    {activeSubscription?.planName || 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bot className="h-8 w-8 text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Bot Status</p>
                  <p className="text-xl font-bold text-white">
                    {configs.find(c => c.isActive)?.botStatus === 'running' ? 'Running' : 'Stopped'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Configurations</p>
                  <p className="text-xl font-bold text-white">{configs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Total Payments</p>
                  <p className="text-xl font-bold text-white">{payments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-effect border-white/20">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="config" className="text-white">Trading Config</TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-white">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments" className="text-white">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Name:</span>
                    <span className="text-white">{session?.user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Email:</span>
                    <span className="text-white">{session?.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Role:</span>
                    <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                      {session?.user?.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    Trading Bot Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {configs.length > 0 ? (
                    <div className="space-y-4">
                      {configs.map((config) => (
                        <div key={config.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium capitalize">{config.exchange}</span>
                            {getStatusBadge(config.botStatus.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-300">
                            {config.lastActivity ? 
                              `Last activity: ${new Date(config.lastActivity).toLocaleDateString()}` : 
                              'No activity yet'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No trading configurations set up yet</p>
                      <p className="text-sm">Go to Trading Config to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Trading Configuration
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure your trading bot settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConfigSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="exchange" className="text-white">Exchange</Label>
                    <Select value={exchange} onValueChange={setExchange}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Bybit" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-white/20">
                        <SelectItem value="bybit" className="text-white">Bybit</SelectItem>
                        <SelectItem value="binance" className="text-gray-400 cursor-not-allowed" disabled>
                          Binance - Coming soon
                        </SelectItem>
                        <SelectItem value="mexc" className="text-gray-400 cursor-not-allowed" disabled>
                          MEXC - Coming soon
                        </SelectItem>
                        <SelectItem value="bingx" className="text-gray-400 cursor-not-allowed" disabled>
                          BingX - Coming soon
                        </SelectItem>
                        <SelectItem value="bitget" className="text-gray-400 cursor-not-allowed" disabled>
                          Bitget - Coming soon
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-white">API Key</Label>
                    <Input
                      id="apiKey"
                      type="text"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiSecret" className="text-white">API Secret</Label>
                    <div className="relative">
                      <Input
                        id="apiSecret"
                        type={showApiSecret ? 'text' : 'password'}
                        placeholder="Enter your API secret"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        {showApiSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Video Tutorial */}
                  <div className="space-y-2">
                    <Label className="text-white">Video Tutorial</Label>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                      <p className="text-gray-300 text-sm mb-3">
                        Watch this tutorial to learn how to get your API keys and Telegram credentials:
                      </p>
                      <div className="bg-black/30 rounded-lg overflow-hidden aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src="https://www.youtube.com/embed/BCSwSqgH4A0"
                          title="KongTrade Video Tutorial"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full"
                          loading="lazy"
                          style={{ willChange: 'auto' }}
                        />
                      </div>
                    </div>
                  </div>

                  {configs.length > 0 && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        ⚠️ <strong>Warning:</strong> Creating a new configuration will delete your current one. Only one configuration is allowed per user.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white hover-glow"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {configs.length > 0 ? 'Replace Configuration' : 'Save Configuration'}
                  </Button>
                </form>

                {configs.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Configuration</h3>
                    <div className="space-y-4">
                      {configs.map((config) => (
                        <div key={config.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                              <p className="text-white font-medium capitalize">{config.exchange}</p>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteConfig(config.id)}
                                  className="ml-4"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                            </div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-400">Status:</span>
                              {getStatusBadge(config.botStatus.toUpperCase())}
                              </div>
                              <p className="text-xs text-gray-400">
                                {config.isActive ? 'Active' : 'Inactive'}
                              </p>
                              {config.lastActivity && (
                                <p className="text-sm text-gray-400 mt-1">
                                  Last activity: {new Date(config.lastActivity).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  My Subscriptions
                </CardTitle>
                <CardDescription className="text-gray-300">
                  View your subscription history and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{subscription.planName}</h3>
                            <p className="text-gray-300 capitalize">{subscription.planType} plan</p>
                            <p className="text-sm text-gray-400">
                              {subscription.startDate && subscription.endDate
                                ? `${new Date(subscription.startDate).toLocaleDateString()} - ${new Date(subscription.endDate).toLocaleDateString()}`
                                : 'Pending activation'
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(subscription.status)}
                            <p className="text-xl font-bold text-white mt-2">${subscription.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Crown className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No subscriptions yet</p>
                    <p>Purchase a plan to start trading</p>
                    <Button 
                      onClick={() => {
                        // Navigate to home page with pricing hash
                        // window.location.href ensures browser handles hash scrolling properly
                        window.location.href = '/#pricing'
                      }}
                      className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                        View Plans
                      </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment History
                </CardTitle>
                <CardDescription className="text-gray-300">
                  View your payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">${payment.amount}</p>
                            <p className="text-gray-300 capitalize">{payment.paymentMethod} wallet</p>
                            <p className="text-sm text-gray-400">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                            {payment.txid && (
                              <p className="text-xs text-gray-500 font-mono mt-1">
                                TXID: {payment.txid.substring(0, 20)}...
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No payments yet</p>
                    <p>Your payment history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
