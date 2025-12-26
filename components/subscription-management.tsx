
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  Copy,
  User,
  Calendar,
  DollarSign,
  Building
} from 'lucide-react'

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
    startDate?: string
    endDate?: string
  } | null
}

interface SubscriptionStats {
  pending: number
  active: number
  expired: number
}

export function SubscriptionManagement() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'expired'>('pending')
  const [stats, setStats] = useState<SubscriptionStats>({ pending: 0, active: 0, expired: 0 })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        calculateStats(data.payments || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (paymentsData: Payment[]) => {
    const stats = {
      pending: paymentsData.filter(p => p.status === 'PENDING').length,
      active: paymentsData.filter(p => p.subscription?.status === 'ACTIVE').length,
      expired: paymentsData.filter(p => p.subscription?.status === 'EXPIRED').length,
    }
    setStats(stats)
  }

  const handleApprovePayment = async (paymentId: string) => {
    try {
      const response = await fetch('/api/admin/approve-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Payment Approved',
          description: 'Payment confirmed and subscription activated!',
        })
        fetchPayments()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to approve payment',
        })
      }
    } catch (error) {
      console.error('Payment approval error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error approving payment. Please try again.',
      })
    }
  }

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, status: 'FAILED' }),
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Payment Rejected',
          description: 'Payment has been rejected.',
        })
        fetchPayments()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to reject payment',
        })
      }
    } catch (error) {
      console.error('Payment rejection error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error rejecting payment. Please try again.',
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      variant: 'success',
      title: 'Copied',
      description: 'Copied to clipboard!',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Ожидает', icon: Clock },
      ACTIVE: { color: 'bg-green-500/20 text-green-400', text: 'Активна', icon: CheckCircle },
      EXPIRED: { color: 'bg-red-500/20 text-red-400', text: 'Истекла', icon: XCircle },
      COMPLETED: { color: 'bg-green-500/20 text-green-400', text: 'Выполнен', icon: CheckCircle },
      FAILED: { color: 'bg-red-500/20 text-red-400', text: 'Отклонен', icon: XCircle },
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

  const getFilteredPayments = () => {
    return payments.filter(payment => {
      if (activeTab === 'pending') {
        return payment.status === 'PENDING'
      } else if (activeTab === 'active') {
        return payment.subscription?.status === 'ACTIVE'
      } else if (activeTab === 'expired') {
        return payment.subscription?.status === 'EXPIRED'
      }
      return false
    })
  }

  const sortedPayments = getFilteredPayments().sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  if (loading) {
    return <div className="text-white text-center py-8">Загрузка подписок...</div>
  }

  return (
    <Card className="glass-effect border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Управление подписками
        </CardTitle>
        <CardDescription className="text-gray-300">
          Управление пользовательскими подписками и платежами
        </CardDescription>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mt-4">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pending')}
            className={activeTab === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'text-white hover:bg-white/10'}
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending ({stats.pending})
          </Button>
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
            className={activeTab === 'active' ? 'bg-green-500/20 text-green-400' : 'text-white hover:bg-white/10'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Active ({stats.active})
          </Button>
          <Button
            variant={activeTab === 'expired' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('expired')}
            className={activeTab === 'expired' ? 'bg-red-500/20 text-red-400' : 'text-white hover:bg-white/10'}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Expired ({stats.expired})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedPayments.length > 0 ? (
          <div className="space-y-4">
            {sortedPayments.map((payment, index) => (
              <div key={payment.id} className="p-6 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                  {/* 0. Нумерация */}
                  <div className="flex items-center">
                    <div className="bg-cyan-500/20 text-cyan-400 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>

                  {/* 1. Status */}
                  <div className="flex justify-center lg:justify-start">
                    {payment.subscription ? getStatusBadge(payment.subscription.status) : getStatusBadge(payment.status)}
                  </div>

                  {/* 2. User Name */}
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-white font-medium">{payment.user.name || 'Не указано'}</p>
                    </div>
                    <p className="text-gray-400 text-sm">{payment.user.email}</p>
                  </div>

                  {/* 3. TXID and Exchange */}
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <Copy className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-300 text-sm">TXID:</span>
                    </div>
                    {payment.txid ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(payment.txid || '')}
                        className="text-cyan-400 hover:text-cyan-300 p-0 h-auto text-sm font-mono"
                      >
                        {payment.txid.substring(0, 12)}...
                      </Button>
                    ) : (
                      <span className="text-gray-500 text-sm">Не указан</span>
                    )}
                    <div className="flex items-center justify-center lg:justify-start mt-1">
                      <Building className="h-3 w-3 text-gray-400 mr-1" />
                      <p className="text-gray-400 text-sm capitalize">{payment.paymentMethod}</p>
                    </div>
                  </div>

                  {/* 4. Plan and Amount */}
                  <div className="text-center lg:text-left">
                    {payment.subscription && (
                      <>
                        <div className="flex items-center justify-center lg:justify-start mb-2">
                          <Crown className="h-4 w-4 text-gold-400 mr-2" />
                          <p className="text-white font-medium">{payment.subscription.planName}</p>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start">
                          <DollarSign className="h-3 w-3 text-green-400 mr-1" />
                          <p className="text-green-400 font-semibold">
                            ${payment.amount}
                          </p>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          ({payment.subscription.planType === 'monthly' ? '1 месяц' : '3 месяца'})
                        </p>
                      </>
                    )}
                  </div>

                  {/* 5. Date and Actions */}
                  <div className="text-center lg:text-right">
                    <div className="flex items-center justify-center lg:justify-end mb-3">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-gray-300 text-sm">
                          {new Date(payment.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(payment.createdAt).toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {activeTab === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleApprovePayment(payment.id)}
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Подтвердить
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRejectPayment(payment.id)}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    )}

                    {activeTab === 'active' && payment.subscription?.endDate && (
                      <div className="mt-2">
                        <p className="text-gray-400 text-xs">Истекает:</p>
                        <p className="text-yellow-400 text-sm">
                          {new Date(payment.subscription.endDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Нет {activeTab === 'pending' ? 'ожидающих' : activeTab === 'active' ? 'активных' : 'истекших'} подписок</p>
            <p>Подписки появятся здесь, когда будут доступны</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Дополнительный компонент Crown для плана подписки
function Crown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  )
}
