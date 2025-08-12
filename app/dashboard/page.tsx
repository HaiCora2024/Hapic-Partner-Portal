
'use client';

import { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { LeadsTable } from '@/components/dashboard/leads-table';
import { PartnerSetupModal } from '@/components/partner-setup-modal';
import { Button } from '@/components/ui/button';

interface StatsData {
  total: number;
  pending: number;
  approved: number;
  confirmedEarnings: number;
}

export default function DashboardPage() {
  console.log({
    StatsCards: typeof StatsCards,
    LeadsTable: typeof LeadsTable,
    PartnerSetupModal: typeof PartnerSetupModal,
    Button: typeof Button,
  });

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    pending: 0,
    approved: 0,
    confirmedEarnings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/partner/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            total: data.total || 0,
            pending: data.pending || 0,
            approved: data.approved || 0,
            confirmedEarnings: data.confirmedEarnings || 0
          });
        } else {
          console.error('Failed to load stats');
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning, Partner!</h1>
          <p className="text-muted-foreground">
            Your partner program overview and recent activity
          </p>
        </div>
        <Button onClick={() => setShowSetupModal(true)} variant="outline">
          Get Referral Code
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        typeof StatsCards === 'function' ? <StatsCards stats={stats} /> : <div>Stats component not available</div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Recent Leads</h2>
          <p className="text-sm text-muted-foreground">
            Track your submitted leads and their current status
          </p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/leads/new'}>
          + Submit Lead
        </Button>
      </div>

      {typeof LeadsTable === 'function' ? <LeadsTable /> : <div>Leads table not available</div>}

      {showSetupModal && typeof PartnerSetupModal === 'function' && (
        <PartnerSetupModal 
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onSuccess={(refLink, qrCode) => {
            console.log('Partner setup successful:', { refLink, qrCode });
            setShowSetupModal(false);
          }}
        />
      )}
    </div>
  );
}
