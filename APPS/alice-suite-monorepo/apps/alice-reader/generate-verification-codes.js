// Simple script to generate verification codes
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Alice book ID
const ALICE_BOOK_ID = '550e8400-e29b-41d4-a716-446655440000';

// Generate random verification code
function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars: 0,O,1,I
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateVerificationCodes() {
  console.log('🚀 Generating verification codes...');
  
  // Generate 10 random codes
  const randomCodes = [];
  for (let i = 0; i < 10; i++) {
    randomCodes.push(generateRandomCode());
  }
  
  // Test codes
  const testCodes = ['ALICE123', 'WONDERLAND', 'RABBIT', 'TEAPARTY', 'CHESHIRE'];
  
  const allCodes = [...randomCodes, ...testCodes];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const code of allCodes) {
    try {
      // Check if code already exists
      const { data: existing } = await supabase
        .from('verification_codes')
        .select('code')
        .eq('code', code)
        .limit(1);
      
      if (existing && existing.length > 0) {
        console.log(`⚠️  Code ${code} already exists, skipping`);
        continue;
      }
      
      // Create verification code
      const { data, error } = await supabase
        .from('verification_codes')
        .insert({
          code: code,
          book_id: ALICE_BOOK_ID,
          is_used: false,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(`❌ Error creating ${code}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Created verification code: ${code}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error processing ${code}:`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 Verification codes generation completed!`);
  console.log(`✅ Successfully created: ${successCount} codes`);
  console.log(`❌ Errors: ${errorCount} codes`);
  
  // Show all verification codes
  const { data: allVerificationCodes } = await supabase
    .from('verification_codes')
    .select('code, is_used, created_at')
    .eq('book_id', ALICE_BOOK_ID)
    .order('created_at', { ascending: false });
  
  if (allVerificationCodes && allVerificationCodes.length > 0) {
    console.log('\n📋 All verification codes:');
    allVerificationCodes.forEach(code => {
      const status = code.is_used ? '🔒 USED' : '🔓 AVAILABLE';
      console.log(`  ${code.code} - ${status}`);
    });
  }
}

// Run the script
generateVerificationCodes().catch(console.error);