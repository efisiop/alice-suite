import { RealTimeEvent, ActiveSession, ConsultantSubscription } from '../types';
export declare class SupabaseClient {
    private client;
    constructor();
    storeEvent(event: RealTimeEvent): Promise<void>;
    updateActiveSession(session: ActiveSession): Promise<void>;
    getActiveSessions(userId?: string): Promise<ActiveSession[]>;
    getConsultantSubscriptions(consultantId: string): Promise<ConsultantSubscription[]>;
    getRecentEvents(limit?: number, userId?: string): Promise<RealTimeEvent[]>;
    getOnlineUsers(): Promise<any[]>;
    getDashboardStats(): Promise<any>;
    cleanupOldSessions(): Promise<void>;
    subscribeToRealtimeEvents(callback: (event: any) => void): Promise<void>;
    getClient(): import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
}
//# sourceMappingURL=supabase-client.d.ts.map