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
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
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

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                Manage and track all your submitted leads
              </CardDescription>
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