-- Real-time events table
CREATE TABLE IF NOT EXISTS real_time_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_realtime_events_user_id ON real_time_events(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_events_event_type ON real_time_events(event_type);
CREATE INDEX IF NOT EXISTS idx_realtime_events_timestamp ON real_time_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_realtime_events_session_id ON real_time_events(session_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_realtime_events_user_timestamp ON real_time_events(user_id, timestamp DESC);

-- Active user sessions table
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for active sessions
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_session_id ON active_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_is_active ON active_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_activity ON active_sessions(last_activity DESC);

-- Consultant subscriptions table
CREATE TABLE IF NOT EXISTS consultant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_types TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for consultant subscriptions
CREATE INDEX IF NOT EXISTS idx_consultant_subscriptions_consultant_id ON consultant_subscriptions(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_subscriptions_is_active ON consultant_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_consultant_subscriptions_event_types ON consultant_subscriptions USING GIN(event_types);

-- Event subscriptions table for fine-grained control
CREATE TABLE IF NOT EXISTS event_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_types TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for event subscriptions
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_user_id ON event_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_target_user_id ON event_subscriptions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_is_active ON event_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_event_types ON event_subscriptions USING GIN(event_types);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_active_sessions_updated_at ON active_sessions;
CREATE TRIGGER update_active_sessions_updated_at
    BEFORE UPDATE ON active_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultant_subscriptions_updated_at ON consultant_subscriptions;
CREATE TRIGGER update_consultant_subscriptions_updated_at
    BEFORE UPDATE ON consultant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_subscriptions_updated_at ON event_subscriptions;
CREATE TRIGGER update_event_subscriptions_updated_at
    BEFORE UPDATE ON event_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean old events
CREATE OR REPLACE FUNCTION clean_old_events()
RETURNS void AS $$
BEGIN
    DELETE FROM real_time_events 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    DELETE FROM active_sessions 
    WHERE last_activity < NOW() - INTERVAL '24 hours' 
    OR is_active = FALSE;
END;
$$ language 'plpgsql';

-- Scheduled job to clean old events (run daily)
-- Note: This would typically be set up with pg_cron extension
-- SELECT cron.schedule('clean-old-events', '0 0 * * *', 'SELECT clean_old_events()');

-- View for active readers with latest activity
CREATE OR REPLACE VIEW active_readers_view AS
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'first_name' as first_name,
    u.raw_user_meta_data->>'last_name' as last_name,
    s.last_activity,
    s.device_info,
    s.session_id,
    COUNT(e.id) as total_events
FROM auth.users u
JOIN active_sessions s ON u.id = s.user_id
LEFT JOIN real_time_events e ON u.id = e.user_id
WHERE s.is_active = TRUE
GROUP BY u.id, u.email, u.raw_user_meta_data, s.last_activity, s.device_info, s.session_id;

-- View for consultant dashboard
CREATE OR REPLACE VIEW consultant_dashboard_view AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
FROM real_time_events
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), event_type
ORDER BY hour DESC, event_count DESC;