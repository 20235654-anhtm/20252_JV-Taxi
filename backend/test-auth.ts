import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Testing Supabase Auth Signup...');
  const { data, error } = await supabase.auth.signUp({
    email: 'test_signup@example.com',
    password: 'password123',
  });
  console.log('Error:', error);
  console.log('Data:', data);
}

main();
