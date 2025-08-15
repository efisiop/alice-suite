"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
class SupabaseClient {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL || 'https://blwypdcobizmpidmuhvq.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
        this.client = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async storeEvent(event) {
        try {
            const { error } = await this.client
                .from('real_time_events')
                .insert({
                id: event.id,
                user_id: event.userId,
                event_type: event.eventType,
                event_data: event.eventData,
                timestamp: event.timestamp,
                session_id: event.sessionId,
                metadata: event.metadata || {}
            });
            if (error) {
                console.error('❌ Error storing event in Supabase:', error);
                throw error;
            }
        }
        catch (error) {
            console.error('❌ Error in storeEvent:', error);
            throw error;
        }
    }
    async updateActiveSession(session) {
        try {
            const { error } = await this.client
                .from('active_sessions')
                .upsert({
                id: session.id,
                user_id: session.userId,
                session_id: session.sessionId,
                device_info: session.deviceInfo || {},
                last_activity: session.lastActivity,
                ip_address: session.ipAddress,
                is_active: session.isActive
            }, {
                onConflict: 'session_id'
            });
            if (error) {
                console.error('❌ Error updating active session:', error);
                throw error;
            }
        }
        catch (error) {
            console.error('❌ Error in updateActiveSession:', error);
            throw error;
        }
    }
    async getActiveSessions(userId) {
        try {
            let query = this.client
                .from('active_sessions')
                .select('*')
                .eq('is_active', true);
            if (userId) {
                query = query.eq('user_id', userId);
            }
            const { data, error } = await query;
            if (error) {
                console.error('❌ Error getting active sessions:', error);
                throw error;
            }
            return (data || []).map(session => ({
                id: session.id,
                userId: session.user_id,
                sessionId: session.session_id,
                deviceInfo: session.device_info,
                lastActivity: new Date(session.last_activity),
                ipAddress: session.ip_address,
                isActive: session.is_active
            }));
        }
        catch (error) {
            console.error('❌ Error in getActiveSessions:', error);
            return [];
        }
    }
    async getConsultantSubscriptions(consultantId) {
        try {
            const { data, error } = await this.client
                .from('consultant_subscriptions')
                .select('*')
                .eq('consultant_id', consultantId)
                .eq('is_active', true);
            if (error) {
                console.error('❌ Error getting consultant subscriptions:', error);
                throw error;
            }
            return (data || []).map(sub => ({
                consultantId: sub.consultant_id,
                eventTypes: sub.event_types || [],
                isActive: sub.is_active,
                createdAt: new Date(sub.created_at)
            }));
        }
        catch (error) {
            console.error('❌ Error in getConsultantSubscriptions:', error);
            return [];
        }
    }
    async getRecentEvents(limit = 50, userId) {
        try {
            let query = this.client
                .from('real_time_events')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(limit);
            if (userId) {
                query = query.eq('user_id', userId);
            }
            const { data, error } = await query;
            if (error) {
                console.error('❌ Error getting recent events:', error);
                throw error;
            }
            return (data || []).map(event => ({
                id: event.id,
                userId: event.user_id,
                eventType: event.event_type,
                eventData: event.event_data,
                timestamp: new Date(event.timestamp),
                sessionId: event.session_id,
                metadata: event.metadata || {}
            }));
        }
        catch (error) {
            console.error('❌ Error in getRecentEvents:', error);
            return [];
        }
    }
    async getOnlineUsers() {
        try {
            const { data, error } = await this.client
                .from('active_readers_view')
                .select('*')
                .order('last_activity', { ascending: false });
            if (error) {
                console.error('❌ Error getting online users:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            console.error('❌ Error in getOnlineUsers:', error);
            return [];
        }
    }
    async getDashboardStats() {
        try {
            const { data, error } = await this.client
                .from('consultant_dashboard_view')
                .select('*')
                .limit(24); // Last 24 hours
            if (error) {
                console.error('❌ Error getting dashboard stats:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            console.error('❌ Error in getDashboardStats:', error);
            return [];
        }
    }
    async cleanupOldSessions() {
        try {
            const { error } = await this.client.rpc('clean_old_events');
            if (error) {
                console.error('❌ Error cleaning old sessions:', error);
                throw error;
            }
            console.log('🧹 Cleaned old sessions and events');
        }
        catch (error) {
            console.error('❌ Error in cleanupOldSessions:', error);
        }
    }
    async subscribeToRealtimeEvents(callback) {
        try {
            const channel = this.client
                .channel('realtime-events')
                .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'real_time_events'
            }, callback)
                .subscribe();
            console.log('📡 Subscribed to realtime events');
        }
        catch (error) {
            console.error('❌ Error subscribing to realtime events:', error);
        }
    }
    getClient() {
        return this.client;
    }
}
exports.SupabaseClient = SupabaseClient;
//# sourceMappingURL=supabase-client.js.map