'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, 
  Search, 
  CreditCard, 
  Bot, 
  LogOut, 
  Crown, 
  Activity,
  Download,
  Eye,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Square,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  pendingPayments: number
  runningBots: number
  totalRevenue: number
  monthlyRevenue: number
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  subscriptions: any[]
  payments: any[]
  configs: any[]
  referralCode?: string
  totalEarnings?: number
}

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  txid: string | null
  status: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  subscription: {
    id: string
    planName: string
    planType: string
    price: number
    status: string
    startDate?: string
    endDate?: string
  } | null
}

export function EnhancedAdminPanel() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats>({ 
    totalUsers: 0, 
    activeSubscriptions: 0, 
    pendingPayments: 0, 
    runningBots: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false)

  useEffect(() => {
    fetchAdminData()
    const interval = setInterval(fetchAdminData, 30000) // Обновление каждые 30 секунд
    return () => clearInterval(interval)
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/payments')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || stats)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments || [])
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentStatusUpdate = async (paymentId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, status }),
      })

      if (response.ok) {
        toast({
          title: 'Payment Updated',
          description: `Payment status updated to ${status}`,
        })
        fetchAdminData()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Failed to update payment',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update payment status',
      })
    }
  }

  const handleBotAction = async (userId: string, action: 'start' | 'stop') => {
    try {
      const response = await fetch('/api/admin/bot-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      })

      if (response.ok) {
        toast({
          title: 'Bot Command Sent',
          description: `Bot ${action} command sent successfully!`,
        })
        fetchAdminData()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Failed to send bot command',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send bot command',
      })
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'No data to export',
      })
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value)
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast({
      title: 'Export Successful',
      description: `${filename} exported successfully`,
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: any }> = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Pending', icon: Clock },
      ACTIVE: { color: 'bg-green-500/20 text-green-400', text: 'Active', icon: CheckCircle },
      EXPIRED: { color: 'bg-red-500/20 text-red-400', text: 'Expired', icon: XCircle },
      CANCELLED: { color: 'bg-gray-500/20 text-gray-400', text: 'Cancelled', icon: XCircle },
      COMPLETED: { color: 'bg-green-500/20 text-green-400', text: 'Completed', icon: CheckCircle },
      FAILED: { color: 'bg-red-500/20 text-red-400', text: 'Failed', icon: XCircle },
      running: { color: 'bg-green-500/20 text-green-400', text: 'Running', icon: Play },
      stopped: { color: 'bg-gray-500/20 text-gray-400', text: 'Stopped', icon: Square },
      not_launched: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Not Launched', icon: Clock },
    }
    const statusInfo = statusMap[status] || statusMap.PENDING
    const IconComponent = statusInfo.icon
    return (
      <Badge className={statusInfo.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {statusInfo.text}
      </Badge>
    )
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.subscriptions.some(sub => sub.status === 'ACTIVE')) ||
                         (statusFilter === 'pending' && user.payments.some(pay => pay.status === 'PENDING'))
    return matchesSearch && matchesStatus
  })

  const filteredPayments = payments.filter(payment => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'pending') return payment.status === 'PENDING'
    if (statusFilter === 'active') return payment.subscription?.status === 'ACTIVE'
    return payment.status === statusFilter.toUpperCase()
  })

  const openUserDetail = (user: User) => {
    setSelectedUser(user)
    setIsUserDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    )
  }

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
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-300">KongTrade CRM System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => exportToCSV(users, 'users')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
            <Button
              variant="outline"
              onClick={() => exportToCSV(payments, 'payments')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Payments
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Users className="h-4 w-4 mr-2" />
                User Dashboard
              </Button>
            </Link>
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

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="glass-effect border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-300">Total Users</p>
                  <p className="text-xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-300">Active Subs</p>
                  <p className="text-xl font-bold text-white">{stats.activeSubscriptions}</p>
                </div>
                <Crown className="h-6 w-6 text-gold-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-300">Pending</p>
                  <p className="text-xl font-bold text-white">{stats.pendingPayments}</p>
                </div>
                <CreditCard className="h-6 w-6 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-300">Running Bots</p>
                  <p className="text-xl font-bold text-white">{stats.runningBots}</p>
                </div>
                <Bot className="h-6 w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-300">Total Revenue</p>
                  <p className="text-xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-300">This Month</p>
                  <p className="text-xl font-bold text-white">${stats.monthlyRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="glass-effect border-white/20">
            <TabsTrigger value="users" className="text-white">Clients</TabsTrigger>
            <TabsTrigger value="payments" className="text-white">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Client Management
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage all your clients, subscriptions, and bot controls
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportToCSV(filteredUsers, 'filtered_users')}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search clients by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-white/20">
                      <SelectItem value="all" className="text-white">All Clients</SelectItem>
                      <SelectItem value="active" className="text-white">Active Subscriptions</SelectItem>
                      <SelectItem value="pending" className="text-white">Pending Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="p-6 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{user.name || 'No name'}</h3>
                              <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                                {user.role}
                              </Badge>
                              {user.subscriptions.some(sub => sub.status === 'ACTIVE') && (
                                <Badge className="bg-green-500/20 text-green-400">
                                  Active Client
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {user.email}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                              {user.referralCode && (
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Ref: {user.referralCode}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserDetail(user)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {/* Subscriptions */}
                          <div className="bg-black/20 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2 flex items-center">
                              <Crown className="h-4 w-4 mr-2" />
                              Subscriptions ({user.subscriptions.length})
                            </h4>
                            {user.subscriptions.length > 0 ? (
                              <div className="space-y-2">
                                {user.subscriptions.slice(0, 2).map((sub) => (
                                  <div key={sub.id} className="text-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-300">{sub.planName}</span>
                                      {getStatusBadge(sub.status)}
                                    </div>
                                    <p className="text-gray-400">${sub.price} ({sub.planType})</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm">No subscriptions</p>
                            )}
                          </div>

                          {/* Payments */}
                          <div className="bg-black/20 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2 flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Payments ({user.payments.length})
                            </h4>
                            {user.payments.length > 0 ? (
                              <div className="space-y-2">
                                {user.payments.slice(0, 2).map((payment) => (
                                  <div key={payment.id} className="text-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-300">${payment.amount}</span>
                                      <div className="flex items-center space-x-2">
                                        {getStatusBadge(payment.status)}
                                        {payment.status === 'PENDING' && (
                                          <div className="flex space-x-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handlePaymentStatusUpdate(payment.id, 'COMPLETED')}
                                              className="text-green-400 hover:text-green-300 p-1 h-auto"
                                              title="Approve"
                                            >
                                              ✓
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handlePaymentStatusUpdate(payment.id, 'FAILED')}
                                              className="text-red-400 hover:text-red-300 p-1 h-auto"
                                              title="Reject"
                                            >
                                              ✗
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-gray-400 text-xs">{payment.paymentMethod}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm">No payments</p>
                            )}
                          </div>

                          {/* Bot Control */}
                          <div className="bg-black/20 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2 flex items-center">
                              <Bot className="h-4 w-4 mr-2" />
                              Trading Bots ({user.configs.length})
                            </h4>
                            {user.configs.length > 0 ? (
                              <div className="space-y-2">
                                {user.configs.map((config) => (
                                  <div key={config.id} className="text-sm">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-gray-300 capitalize">{config.exchange}</span>
                                      {getStatusBadge(config.botStatus)}
                                    </div>
                                    <div className="flex space-x-1 mt-1">
                                      <Button
                                        size="sm"
                                        onClick={() => handleBotAction(user.id, 'start')}
                                        disabled={config.botStatus === 'running'}
                                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 text-xs px-2 py-1 h-auto"
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Start
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleBotAction(user.id, 'stop')}
                                        disabled={config.botStatus !== 'running'}
                                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs px-2 py-1 h-auto"
                                      >
                                        <Square className="h-3 w-3 mr-1" />
                                        Stop
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm">No trading configs</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No clients found</p>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Management
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Review and manage all payment transactions
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportToCSV(filteredPayments, 'filtered_payments')}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPayments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <div key={payment.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                ${payment.amount} - {payment.paymentMethod.toUpperCase()}
                              </h3>
                              {getStatusBadge(payment.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                              <div>
                                <p className="text-gray-400">Client:</p>
                                <p className="text-white">{payment.user.name || payment.user.email}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Date:</p>
                                <p>{new Date(payment.createdAt).toLocaleString()}</p>
                              </div>
                              {payment.subscription && (
                                <>
                                  <div>
                                    <p className="text-gray-400">Plan:</p>
                                    <p className="text-white">{payment.subscription.planName} ({payment.subscription.planType})</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Subscription Status:</p>
                                    {getStatusBadge(payment.subscription.status)}
                                  </div>
                                </>
                              )}
                              {payment.txid && (
                                <div className="col-span-2">
                                  <p className="text-gray-400">Transaction ID:</p>
                                  <p className="text-white font-mono text-xs break-all">{payment.txid}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          {payment.status === 'PENDING' && (
                            <div className="flex flex-col space-y-2">
                              <Button
                                size="sm"
                                onClick={() => handlePaymentStatusUpdate(payment.id, 'COMPLETED')}
                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handlePaymentStatusUpdate(payment.id, 'FAILED')}
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No payments found</p>
                    <p>Payment transactions will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Detail Modal */}
      <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <DialogContent className="glass-effect border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">
              Client Details: {selectedUser?.name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Complete information about the client
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 mt-4">
              {/* User Info */}
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Client Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name:</p>
                    <p className="text-white">{selectedUser.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email:</p>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Role:</p>
                    <Badge className="bg-blue-500/20 text-blue-400 capitalize mt-1">
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-400">Joined:</p>
                    <p className="text-white">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedUser.referralCode && (
                    <div>
                      <p className="text-gray-400">Referral Code:</p>
                      <p className="text-white font-mono">{selectedUser.referralCode}</p>
                    </div>
                  )}
                  {selectedUser.totalEarnings !== undefined && (
                    <div>
                      <p className="text-gray-400">Total Earnings:</p>
                      <p className="text-white">${selectedUser.totalEarnings.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscriptions */}
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Subscriptions ({selectedUser.subscriptions.length})</h3>
                {selectedUser.subscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.subscriptions.map((sub) => (
                      <div key={sub.id} className="bg-white/5 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{sub.planName}</span>
                          {getStatusBadge(sub.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                          <div>
                            <p className="text-gray-400">Type:</p>
                            <p>{sub.planType}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Price:</p>
                            <p>${sub.price}</p>
                          </div>
                          {sub.startDate && (
                            <div>
                              <p className="text-gray-400">Start:</p>
                              <p>{new Date(sub.startDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {sub.endDate && (
                            <div>
                              <p className="text-gray-400">End:</p>
                              <p>{new Date(sub.endDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No subscriptions</p>
                )}
              </div>

              {/* Payments */}
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Payment History ({selectedUser.payments.length})</h3>
                {selectedUser.payments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.payments.map((payment) => (
                      <div key={payment.id} className="bg-white/5 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">${payment.amount} - {payment.paymentMethod}</span>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                          <div>
                            <p className="text-gray-400">Date:</p>
                            <p>{new Date(payment.createdAt).toLocaleString()}</p>
                          </div>
                          {payment.txid && (
                            <div>
                              <p className="text-gray-400">TXID:</p>
                              <p className="font-mono text-xs break-all">{payment.txid}</p>
                            </div>
                          )}
                        </div>
                        {payment.status === 'PENDING' && (
                          <div className="flex space-x-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                handlePaymentStatusUpdate(payment.id, 'COMPLETED')
                                setIsUserDetailOpen(false)
                              }}
                              className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                handlePaymentStatusUpdate(payment.id, 'FAILED')
                                setIsUserDetailOpen(false)
                              }}
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No payments</p>
                )}
              </div>

              {/* Trading Configs */}
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Trading Configurations ({selectedUser.configs.length})</h3>
                {selectedUser.configs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.configs.map((config) => (
                      <div key={config.id} className="bg-white/5 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium capitalize">{config.exchange}</span>
                          {getStatusBadge(config.botStatus)}
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleBotAction(selectedUser.id, 'start')}
                            disabled={config.botStatus === 'running'}
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Bot
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleBotAction(selectedUser.id, 'stop')}
                            disabled={config.botStatus !== 'running'}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Stop Bot
                          </Button>
                        </div>
                        {config.lastActivity && (
                          <p className="text-xs text-gray-400 mt-2">
                            Last activity: {new Date(config.lastActivity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No trading configurations</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

