import { DataStore } from './store';
import { SupabaseStore } from './supabaseStore';
import { LocalStore } from './localStore';
import { supabase } from '../supabaseClient';

// Singleton instance
let storeInstance: DataStore | null = null;

export const getStore = (): DataStore => {
    if (storeInstance) return storeInstance;

    // Check if Supabase is configured
    if (supabase) {
        console.log('Using Supabase Store');
        storeInstance = new SupabaseStore();
    } else {
        console.log('Using Local Storage Fallback');
        storeInstance = new LocalStore();
    }

    return storeInstance;
};
