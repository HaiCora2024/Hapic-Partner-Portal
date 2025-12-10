interface Lead {
  id: string;
  status: string;
  [key: string]: any;
}

export function calculateStats(leads: Lead[]) {
  const total = leads.length;
  const pending = leads.filter(l => l.status === 'submitted' || l.status === 'in_review').length;
  const approved = leads.filter(l => l.status === 'approved').length;
  const rejected = leads.filter(l => l.status === 'rejected').length;
  
  // €100 for submitted, additional €100 for approved
  const potentialEarnings = total * 100;
  const confirmedEarnings = approved * 200; // €100 submission + €100 approval
  
  return {
    total,
    pending,
    approved,
    rejected,
    potentialEarnings,
    confirmedEarnings,
  };
}

export const LEAD_STATUSES = [
  { value: 'submitted', label: 'Submitted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_review', label: 'In Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
] as const;