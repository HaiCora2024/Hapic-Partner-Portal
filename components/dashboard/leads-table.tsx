
'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Lead {
  id: string;
  contact_name: string;
  contact_email: string;
  company_name: string;
  status: string;
  created_at: string;
  source?: 'applications' | 'leads';
}

interface LeadsTableProps {
  leads?: Lead[];
  onStatusUpdate?: (leadId: string, newStatus: string) => void;
}

export function LeadsTable({ leads: externalLeads, onStatusUpdate }: LeadsTableProps = {}) {
  const [internalLeads, setInternalLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Use external leads if provided, otherwise fetch internally
  const leads = externalLeads || internalLeads;

  useEffect(() => {
    // Only fetch if external leads are not provided
    if (externalLeads) {
      setLoading(false);
      return;
    }

    async function fetchLeads() {
      try {
        const response = await fetch('/api/leads');
        if (response.ok) {
          const data = await response.json();
          setInternalLeads(data.leads || []);
        } else {
          console.error('Failed to fetch leads');
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [externalLeads]);

  if (loading) {
    return <div className="text-center py-8">Loading leads...</div>;
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No leads submitted yet
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.contact_name}</TableCell>
              <TableCell>{lead.contact_email}</TableCell>
              <TableCell>{lead.company_name}</TableCell>
              <TableCell>
                <Badge variant={lead.status === 'approved' ? 'default' : 'secondary'}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>
                {lead.source && (
                  <Badge
                    variant="outline"
                    className={lead.source === 'applications' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}
                  >
                    {lead.source === 'applications' ? 'Application' : 'Lead'}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(lead.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
