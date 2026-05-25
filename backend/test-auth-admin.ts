import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Testing Supabase Admin Create User...');
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'test_admin_signup@example.com',
    password: 'password123',
    email_confirm: true
  });
  console.log('Error:', error);
  console.log('Data:', data);
}

main();
