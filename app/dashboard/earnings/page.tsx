'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, Calendar, CreditCard } from 'lucide-react';

interface StatsData {
  total: number;
  approved: number;
  pending: number;
  confirmedEarnings: number;
  totalPendingAmount: number;
  nextPayout: number;
  totalPaid: number;
  conversionRate: number;
}

interface Commission {
  id: string;
  leadCompanyName: string;
  commissionStatus: string;
  paymentAmount: number;
  dateEarned: string;
  datePaid: string | null;
}

export default function EarningsPage() {
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    approved: 0,
    pending: 0,
    confirmedEarnings: 0,
    totalPendingAmount: 0,
    nextPayout: 0,
    totalPaid: 0,
    conversionRate: 0
  });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionsLoading, setCommissionsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load stats
        const statsResponse = await fetch('/api/partner/stats');
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats({
            total: data.total || 0,
            approved: data.approved || 0,
            pending: data.pending || 0,
            confirmedEarnings: data.confirmedEarnings || 0,
            totalPendingAmount: data.totalPendingAmount || 0,
            nextPayout: data.nextPayout || 0,
            totalPaid: data.totalPaid || 0,
            conversionRate: data.conversionRate || 0
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }

      try {
        // Load commissions
        const commissionsResponse = await fetch('/api/partner/commissions');
        if (commissionsResponse.ok) {
          const data = await commissionsResponse.json();
          setCommissions(data.commissions || []);
        }
      } catch (error) {
        console.error('Error loading commissions:', error);
      } finally {
        setCommissionsLoading(false);
      }
    }

    loadData();
  }, []);

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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalPendingAmount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.nextPayout}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalPaid}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Detailed breakdown of your commissions and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commissionsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading payment history...</p>
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Euro className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No payment history yet</p>
              <p className="text-sm">Commissions will appear here once leads are approved</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead Company Name</TableHead>
                    <TableHead>Commission Status</TableHead>
                    <TableHead>Payment Amount</TableHead>
                    <TableHead>Date Earned</TableHead>
                    <TableHead>Date Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">{commission.leadCompanyName}</TableCell>
                      <TableCell>
                        <Badge variant={commission.commissionStatus === 'paid' ? 'default' : 'secondary'}>
                          {commission.commissionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        €{commission.paymentAmount}
                      </TableCell>
                      <TableCell>
                        {new Date(commission.dateEarned).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {commission.datePaid
                          ? new Date(commission.datePaid).toLocaleDateString()
                          : <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
