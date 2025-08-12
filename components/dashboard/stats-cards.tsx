'use client';

interface StatsCardsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    confirmedEarnings: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Total Leads</div>
        <div className="text-2xl font-bold">{stats.total}</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Pending</div>
        <div className="text-2xl font-bold">{stats.pending}</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Approved</div>
        <div className="text-2xl font-bold">{stats.approved}</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Confirmed Earnings</div>
        <div className="text-2xl font-bold">€{stats.confirmedEarnings}</div>
      </div>
    </div>
  );
}