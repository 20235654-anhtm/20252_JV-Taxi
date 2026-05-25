import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Testing login...');
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'tridithi123@gmail.com', password: 'password123' })
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
}

main();
