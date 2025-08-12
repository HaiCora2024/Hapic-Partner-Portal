
import { useEffect } from 'react';

export function usePartnerSync() {
  useEffect(() => {
    // Sync partner data with Replit user info
    async function syncPartner() {
      try {
        const response = await fetch('/api/partner/sync', {
          method: 'POST'
        });
        
        if (!response.ok) {
          console.error('Failed to sync partner data');
        }
      } catch (error) {
        console.error('Error syncing partner:', error);
      }
    }

    syncPartner();
  }, []);
}
