'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadsTable } from '@/components/dashboard/leads-table';
import type { Lead } from '@/lib/supabase/client';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

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

  async function handleStatusUpdate(leadId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (!error) {
        setLeads(leads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
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
            <LeadsTable 
              leads={leads} 
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}