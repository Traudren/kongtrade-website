
'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Search, 
  CreditCard, 
  Bot, 
  LogOut, 
  Crown, 
  Activity,
  TrendingUp,
  Shield,
  Zap,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { SubscriptionManagement } from '@/components/subscription-management'
import { useToast } from '@/hooks/use-toast'

interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  pendingPayments: number
  runningBots: number
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
}

interface ContactForm {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  status: string
  createdAt: string
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
    configs: any[]
  }
  subscription: {
    id: string
    planName: string
    planType: string
    price: number
    status: string
  } | null
}

export function AdminPanelClient() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeSubscriptions: 0, pendingPayments: 0, runningBots: 0 })
  const [users, setUsers] = useState<User[]>([])
  const [contactForms, setContactForms] = useState<ContactForm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, contactRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/contact-forms')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || { totalUsers: 0, activeSubscriptions: 0, pendingPayments: 0, runningBots: 0 })
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (contactRes.ok) {
        const contactData = await contactRes.json()
        setContactForms(contactData.forms || [])
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
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
          variant: 'success',
          title: 'Bot Command Sent',
          description: `Bot ${action} command sent successfully!`,
        })
        fetchAdminData()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to control bot',
        })
      }
    } catch (error) {
      console.error('Bot control error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error controlling bot. Please try again.',
      })
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
          variant: 'success',
          title: 'Payment Updated',
          description: 'Payment status updated successfully!',
        })
        fetchAdminData()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to update payment',
        })
      }
    } catch (error) {
      console.error('Payment update error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error updating payment. Please try again.',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Pending', icon: Clock },
      ACTIVE: { color: 'bg-green-500/20 text-green-400', text: 'Active', icon: CheckCircle },
      EXPIRED: { color: 'bg-red-500/20 text-red-400', text: 'Expired', icon: XCircle },
      CANCELLED: { color: 'bg-gray-500/20 text-gray-400', text: 'Cancelled', icon: XCircle },
      COMPLETED: { color: 'bg-green-500/20 text-green-400', text: 'Completed', icon: CheckCircle },
      FAILED: { color: 'bg-red-500/20 text-red-400', text: 'Failed', icon: XCircle },
      running: { color: 'bg-green-500/20 text-green-400', text: 'Running', icon: Play },
      stopped: { color: 'bg-gray-500/20 text-gray-400', text: 'Stopped', icon: Square },
      not_launched: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Not Launched', icon: AlertCircle },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.PENDING
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-cyan-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-gold-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-yellow-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Pending Payments</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bot className="h-8 w-8 text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Running Bots</p>
                  <p className="text-2xl font-bold text-white">{stats.runningBots}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="glass-effect border-white/20">
            <TabsTrigger value="subscriptions" className="text-white">Subscriptions</TabsTrigger>
            <TabsTrigger value="users" className="text-white">User Management</TabsTrigger>
            <TabsTrigger value="contacts" className="text-white">Contact Forms</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management & CRM
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Manage users, subscriptions, payments, and bot controls
                </CardDescription>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-white/20">
                      <SelectItem value="all" className="text-white">All Users</SelectItem>
                      <SelectItem value="active" className="text-white">Active Subscriptions</SelectItem>
                      <SelectItem value="pending" className="text-white">Pending Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="space-y-6">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* User Info */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">{user.name || 'No name'}</h3>
                            <p className="text-gray-300 mb-1">{user.email}</p>
                            <p className="text-sm text-gray-400">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                            <Badge className="mt-2 bg-blue-500/20 text-blue-400 capitalize">
                              {user.role}
                            </Badge>
                          </div>

                          {/* Subscription & Payment Info */}
                          <div>
                            <h4 className="text-white font-medium mb-2">Subscription & Payments</h4>
                            {user.subscriptions.length > 0 ? (
                              <div className="space-y-2">
                                {user.subscriptions.map((sub) => (
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

                            {user.payments.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <h5 className="text-xs text-gray-400 uppercase">Recent Payments</h5>
                                {user.payments.slice(0, 2).map((payment) => (
                                  <div key={payment.id} className="flex justify-between items-center text-sm">
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
                                          >
                                            ✓
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handlePaymentStatusUpdate(payment.id, 'FAILED')}
                                            className="text-red-400 hover:text-red-300 p-1 h-auto"
                                          >
                                            ✗
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Bot Control */}
                          <div>
                            <h4 className="text-white font-medium mb-2">Bot Control</h4>
                            {user.configs.length > 0 ? (
                              <div className="space-y-3">
                                {user.configs.map((config) => (
                                  <div key={config.id} className="text-sm">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-gray-300 capitalize">{config.exchange}</span>
                                      {getStatusBadge(config.botStatus)}
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleBotAction(user.id, 'start')}
                                        disabled={config.botStatus === 'running'}
                                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Start
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleBotAction(user.id, 'stop')}
                                        disabled={config.botStatus !== 'running'}
                                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                      >
                                        <Square className="h-3 w-3 mr-1" />
                                        Stop
                                      </Button>
                                    </div>
                                    {config.lastActivity && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        Last activity: {new Date(config.lastActivity).toLocaleDateString()}
                                      </p>
                                    )}
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
                    <p className="text-lg mb-2">No users found</p>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Contact Form Submissions
                </CardTitle>
                <CardDescription className="text-gray-300">
                  View and manage customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contactForms.length > 0 ? (
                  <div className="space-y-4">
                    {contactForms.map((form) => (
                      <div key={form.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-medium">{form.name}</h3>
                            <p className="text-gray-300 text-sm">{form.email}</p>
                            {form.subject && (
                              <p className="text-cyan-400 text-sm font-medium">{form.subject}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(form.status)}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-black/20 rounded p-3 text-gray-300 text-sm">
                          {form.message}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No contact forms yet</p>
                    <p>Customer inquiries will appear here</p>
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
