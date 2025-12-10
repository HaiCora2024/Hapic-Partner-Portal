'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, TrendingUp, Calendar, CreditCard } from 'lucide-react';

interface StatsData {
  total: number;
  approved: number;
  pending: number;
  confirmedEarnings: number;
}

export default function EarningsPage() {
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    approved: 0,
    pending: 0,
    confirmedEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/partner/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            total: data.total || 0,
            approved: data.approved || 0,
            pending: data.pending || 0,
            confirmedEarnings: data.confirmedEarnings || 0
          });
        } else {
          console.error('Failed to load stats');
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  // Calculate conversion rate
  const conversionRate = stats.total > 0
    ? Math.round((stats.approved / stats.total) * 100)
    : 0;

  // Calculate pending earnings (assuming €200 per lead)
  const pendingEarnings = stats.pending * 200;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your commissions and payouts</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.confirmedEarnings}</div>
              <p className="text-xs text-muted-foreground">From {stats.approved} approved leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{pendingEarnings}</div>
              <p className="text-xs text-muted-foreground">From {stats.pending} pending leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.confirmedEarnings}</div>
              <p className="text-xs text-muted-foreground">Scheduled for next month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">{stats.approved} / {stats.total} approved</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>
            Your commission history and payout details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.confirmedEarnings === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Euro className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No earnings yet</p>
              <p className="text-sm">Start submitting leads to earn commissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b">
                <div>
                  <p className="font-medium">Approved Leads Commission</p>
                  <p className="text-sm text-muted-foreground">{stats.approved} leads × €200</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">€{stats.confirmedEarnings}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}