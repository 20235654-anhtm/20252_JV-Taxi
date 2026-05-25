import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('--- SUPABASE AUTH USERS ---');
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching auth users:', error.message);
    return;
  }
  const users = data.users || [];
  users.forEach(u => {
    console.log(`ID: ${u.id} | Email: '${u.email}' | Phone: '${u.phone}'`);
  });
  console.log('---------------------------');
}

main();
