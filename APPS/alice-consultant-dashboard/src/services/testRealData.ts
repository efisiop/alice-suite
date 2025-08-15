// Test file to verify real data integration
import { realUserService } from './realUserService';

export const testRealDataIntegration = async () => {
  console.log('Testing real data integration...');
  
  try {
    // Test 1: Get all real readers
    console.log('\n1. Getting real readers...');
    const readersResult = await realUserService.getReadersWithStats();
    if (readersResult.error) {
      console.error('Error loading readers:', readersResult.error);
    } else {
      console.log(`Found ${readersResult.data?.length || 0} real readers:`);
      readersResult.data?.forEach(reader => {
        console.log(`  - ${reader.user.first_name} ${reader.user.last_name} (${reader.user.email})`);
        console.log(`    Reading time: ${reader.readingStats.total_reading_time} seconds`);
        console.log(`    Books: ${reader.readingStats.total_books}`);
      });
    }

    // Test 2: Get consultant assignments (using a test consultant ID)
    console.log('\n2. Getting consultant assignments...');
    const consultantId = '27ce3a11-1d12-417d-b90a-d1635c7c8ec5'; // efisio's user ID
    const assignmentsResult = await realUserService.getReadersForConsultant(consultantId);
    if (assignmentsResult.error) {
      console.error('Error loading assignments:', assignmentsResult.error);
    } else {
      console.log(`Found ${assignmentsResult.data?.length || 0} assigned readers:`);
      assignmentsResult.data?.forEach(userWithAssignments => {
        console.log(`  - ${userWithAssignments.user.first_name} ${userWithAssignments.user.last_name}`);
        console.log(`    Active assignments: ${userWithAssignments.assignments.filter(a => a.active).length}`);
      });
    }

    console.log('\n✅ Real data integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Real data integration test failed:', error);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testRealDataIntegration();
}