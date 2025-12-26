

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Gift, 
  Share2, 
  Copy,
  TrendingUp,
  Star,
  Crown,
  Zap,
  UserPlus,
  ShoppingBag
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ReferralStats {
  referralCode: string
  referralLink: string
  stats: {
    totalReferrals: number
    paidReferrals: number
    points: number
  }
  referrals: Array<{
    id: string
    name: string
    email: string
    createdAt: string
    hasPurchased: boolean
  }>
}

export function ReferralSection() {
  const [referralData, setReferralData] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [purchasing, setPurchasing] = useState(false)

  // Планы и их стоимость в поинтах
  const plans = [
    { id: 'basic', name: 'Basic Plan', points: 10, description: '1 month subscription' },
    { id: 'professional', name: 'Professional Plan', points: 15, description: '1 month subscription' },
    { id: 'unlimited', name: 'Unlimited Plan', points: 20, description: '1 month subscription' }
  ]

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals')
      if (response.ok) {
        const data = await response.json()
        setReferralData(data)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink)
      toast.success('Referral link copied!')
    }
  }

  const handlePurchaseWithPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!selectedPlan) {
      toast.error('Please select a plan')
      return
    }

    const plan = plans.find(p => p.id === selectedPlan)
    if (!plan) return

    if (referralData && referralData.stats.points < plan.points) {
      toast.error(`Not enough points. You need ${plan.points} points.`)
      return
    }

    setPurchasing(true)
    try {
      const response = await fetch('/api/referrals/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, points: plan.points })
      })

      if (response.ok) {
        toast.success('Subscription purchased successfully!')
        setSelectedPlan('')
        fetchReferralData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to purchase subscription')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading referral data...</div>
  }

  if (!referralData) {
    return <div className="text-center py-8">Error loading data</div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{referralData.stats.totalReferrals}</div>
            <p className="text-xs text-gray-400">
              People registered: {referralData.stats.totalReferrals}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Purchased Users</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{referralData.stats.paidReferrals}</div>
            <p className="text-xs text-gray-400">
              Users who made purchases
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Points Balance</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{referralData.stats.points}</div>
            <p className="text-xs text-gray-400">
              Points earned from referrals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Your Personal Referral Link</CardTitle>
          <CardDescription className="text-gray-400">
            Share this link with friends and earn 1 point for each purchase they make
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input 
              value={referralData.referralLink} 
              readOnly 
              className="font-mono text-sm bg-white/10 border-white/20 text-white"
            />
            <Button onClick={copyReferralLink} className="bg-cyan-500 hover:bg-cyan-600">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="referrals" className="text-white data-[state=active]:bg-cyan-500">My Referrals</TabsTrigger>
          <TabsTrigger value="shop" className="text-white data-[state=active]:bg-cyan-500">Points Shop</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Referral List</CardTitle>
            </CardHeader>
            <CardContent>
              {referralData.referrals.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  You don't have any referrals yet
                </p>
              ) : (
                <div className="space-y-4">
                  {referralData.referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/5">
                      <div>
                        <div className="font-medium text-white">{referral.name}</div>
                        <div className="text-sm text-gray-400">{referral.email}</div>
                        <div className="text-xs text-gray-500">
                          Joined: {new Date(referral.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        {referral.hasPurchased ? (
                          <Badge className="bg-green-500 text-white">
                            <Gift className="h-3 w-3 mr-1" />
                            Purchased
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop" className="space-y-4">
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Points Shop</CardTitle>
              <CardDescription className="text-gray-400">
                Exchange your points for free subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="p-4 border border-white/20 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{plan.name}</h3>
                        <p className="text-sm text-gray-400">{plan.description}</p>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-yellow-400 font-medium">{plan.points} points</span>
                        </div>
                      </div>
                      <div>
                        {referralData.stats.points >= plan.points ? (
                          <Badge className="bg-green-500 text-white">Available</Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            Need {plan.points - referralData.stats.points} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mt-6">
                <Label className="text-white">Select plan to purchase:</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Choose a subscription plan" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/20">
                    {plans.map((plan) => (
                      <SelectItem 
                        key={plan.id} 
                        value={plan.id} 
                        className="text-white"
                        disabled={referralData.stats.points < plan.points}
                      >
                        {plan.name} - {plan.points} points
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handlePurchaseWithPoints(e)
                  }}
                  disabled={!selectedPlan || purchasing}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                >
                  {purchasing ? 'Processing...' : 'Purchase with Points'}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-blue-400 mb-2">How to earn points:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Invite friends using your referral link</li>
                  <li>• Earn 1 point when they make their first purchase</li>
                  <li>• Basic plan: 10 points</li>
                  <li>• Professional plan: 15 points</li>
                  <li>• Unlimited plan: 20 points</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

