'use client';

import { usePartnerSync } from '@/hooks/use-partner-sync';

export function PartnerSyncWrapper({ children }: { children: React.ReactNode }) {
  usePartnerSync();
  return <>{children}</>;
}