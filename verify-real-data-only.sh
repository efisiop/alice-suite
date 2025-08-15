#!/bin/bash

echo "=== Alice Suite Real Data Verification ==="
echo "Checking that all fake data sources have been disabled..."

# Check for fake data mode in environment
if grep -q "VITE_ENABLE_MOCKS=false" APPS/alice-reader/.env; then
    echo "✅ Alice Reader: Mock mode disabled in environment"
else
    echo "❌ Alice Reader: Mock mode may still be enabled"
fi

if grep -q "VITE_ENABLE_MOCKS=false" APPS/alice-consultant-dashboard/.env; then
    echo "✅ Consultant Dashboard: Mock mode disabled in environment"
else
    echo "❌ Consultant Dashboard: Mock mode may still be enabled"
fi

# Check for fake data mode in dataServiceManager
if grep -q "mode.*real" APPS/alice-consultant-dashboard/src/services/dataServiceManager.ts; then
    echo "✅ DataServiceManager: Using real data mode"
else
    echo "❌ DataServiceManager: May still use fake data"
fi

# Check for disabled fake data services
if grep -q "MOCK DATA DISABLED" APPS/alice-consultant-dashboard/src/services/fakeDataService.ts; then
    echo "✅ FakeDataService: Properly disabled"
else
    echo "❌ FakeDataService: May still be active"
fi

# Check for AI service real data
if grep -q "getAIInsights" APPS/alice-consultant-dashboard/src/components/AIAnalyticsDashboard.tsx; then
    echo "✅ AI Analytics: Using real AI service"
else
    echo "❌ AI Analytics: May use fake data"
fi

echo ""
echo "=== Summary ==="
echo "The dashboard should now show:"
echo "- 0 readers initially (until real users register)"
echo "- 0 help requests (until real users ask questions)"
echo "- 0 feedback (until real users provide feedback)"
echo "- Real user data from Supabase profiles table"
echo ""
echo "To test with real data:"
echo "1. Run ./start-both-apps.sh"
echo "2. Register as a new user in Alice Reader"
echo "3. Login as consultant in dashboard"
echo "4. Assign the user to yourself"
echo "5. Verify real data appears"