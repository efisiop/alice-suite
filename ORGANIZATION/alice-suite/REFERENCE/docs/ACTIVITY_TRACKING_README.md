# Activity Tracking Feature

This feature connects the **alice-reader** and **alice-consultant-dashboard** apps to track user activity and display real-time statistics.

## What's New

### 1. Login Tracking
- **alice-reader**: Now tracks when users log in and log out
- **consultant-dashboard**: Shows currently logged-in users in real-time

### 2. Activity Database
- Uses the existing `interactions` table in Supabase
- Tracks various user events: LOGIN, LOGOUT, PAGE_SYNC, AI_QUERY, etc.
- Shared between both applications

## How It Works

### In alice-reader App
1. **Login Tracking**: When a user logs in, an event is automatically recorded
2. **Logout Tracking**: When a user logs out, an event is automatically recorded
3. **Activity Service**: `activityTrackingService.ts` handles all tracking operations

### In consultant-dashboard App
1. **Real-time Monitoring**: Shows currently logged-in users (last 30 minutes)
2. **Activity Dashboard**: New tab showing user activity and engagement
3. **Summary Cards**: Dashboard now shows "Currently Logged In" count

## Files Added/Modified

### alice-reader
- `src/services/activityTrackingService.ts` - New service for tracking
- `src/contexts/AuthContext.tsx` - Added login/logout tracking

### alice-consultant-dashboard
- `src/services/activityTrackingService.ts` - Service to read activity data
- `src/components/Consultant/CurrentlyLoggedInUsers.tsx` - New component
- `src/components/Consultant/ReaderActivityDashboard.tsx` - Added new tab
- `src/pages/Consultant/ConsultantDashboard.tsx` - Added summary card

### Testing
- `alice-reader/scripts/test-activity-tracking.js` - Test script

## Usage

### For Users (alice-reader)
- No action needed! Login/logout tracking happens automatically
- All activity is logged to help consultants provide better support

### For Consultants (consultant-dashboard)
1. **View Currently Logged In**: See who's active right now
2. **Activity Stream**: Monitor recent user activity
3. **Engagement Metrics**: Track user engagement levels
4. **Real-time Updates**: Data refreshes every 30 seconds

## Database Schema

The feature uses the existing `interactions` table:

```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  book_id UUID REFERENCES books(id),
  section_id UUID REFERENCES sections(id),
  page_number INTEGER,
  content TEXT,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Event Types Tracked

- `LOGIN` - User logged in
- `LOGOUT` - User logged out
- `PAGE_SYNC` - User navigated to a page
- `SECTION_SYNC` - User moved to a section
- `DEFINITION_LOOKUP` - User looked up a word
- `AI_QUERY` - User asked AI for help
- `HELP_REQUEST` - User requested help
- `FEEDBACK_SUBMISSION` - User submitted feedback

## Testing

To test the activity tracking:

```bash
cd alice-reader
node scripts/test-activity-tracking.js
```

This will:
1. Check if the interactions table exists
2. Insert a test login event
3. Query for currently logged-in users
4. Clean up test data

## Next Steps

This is just the beginning! Future enhancements could include:

1. **More Activity Types**: Track reading progress, time spent, etc.
2. **Real-time Notifications**: Alert consultants when users need help
3. **Analytics Dashboard**: More detailed statistics and charts
4. **User Behavior Analysis**: Identify patterns and engagement trends
5. **Automated Interventions**: AI prompts based on user activity

## Troubleshooting

### Common Issues

1. **No users showing as logged in**
   - Check if users have actually logged in within the last 30 minutes
   - Verify the interactions table exists and has data
   - Check browser console for any errors

2. **Activity not being tracked**
   - Ensure the activityTrackingService is properly imported
   - Check Supabase connection and permissions
   - Verify RLS policies allow the operations

3. **Dashboard not updating**
   - Check if the auto-refresh interval is working (30 seconds)
   - Verify the activityTrackingService is being called
   - Check for any JavaScript errors in the console

### Debug Mode

To enable debug logging, check the browser console for messages from:
- `ActivityTrackingService`
- `AuthContext` (for login/logout events)

## Security

- All activity tracking respects user privacy
- Only consultants can view aggregated activity data
- Individual user data is protected by Row Level Security (RLS)
- No sensitive information is logged

---

This feature provides the foundation for linking the two applications and enabling better consultant support for readers. Start with login tracking and expand from there! 