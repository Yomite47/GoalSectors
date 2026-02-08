import { redirect } from 'next/navigation';
import { getStore } from '@/lib/data';

export async function requireOnboarding(userId: string) {
    if (!userId) {
        // No user ID found, this shouldn't happen in normal flow if using the provider correctly
        // But if it does, we might need to handle it. 
        // For this helper, we assume we have a userId to check.
        return false;
    }

    const store = getStore();
    const sectors = await store.getEnabledSectors(userId);

    // If no sectors are enabled, user hasn't completed onboarding
    if (!sectors || sectors.length === 0) {
        return false;
    }

    return true;
}
