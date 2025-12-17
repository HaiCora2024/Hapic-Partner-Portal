'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadsTable } from '@/components/dashboard/leads-table';
import { Plus } from 'lucide-react';

interface Lead {
  id: string;
  contact_name: string;
  contact_email: string;
  company_name: string;
  status: string;
  created_at: string;
  source?: 'applications' | 'leads';
  profit: number;
}

interface StatsData {
  total: number;
  approved: number;
  conversionRate: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    approved: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  async function fetchLeads() {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch('/api/partner/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          total: data.total || 0,
          approved: data.approved || 0,
          conversionRate: data.conversionRate || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-6">
                <div>
                  <CardTitle>All Leads</CardTitle>
                  <CardDescription>
                    Manage and track all your submitted leads
                  </CardDescription>
                </div>
                <div className="border-l pl-6">
                  <div className="text-sm font-medium text-muted-foreground">Conversion Rate</div>
                  <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.approved} / {stats.total} leads
                  </div>
                </div>
              </div>
            </div>
            <Link href="/dashboard/leads/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Submit Lead
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <LeadsTable leads={leads} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}