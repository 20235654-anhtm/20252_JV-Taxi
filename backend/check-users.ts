import prisma from './src/config/db';

async function main() {
  const profiles = await prisma.profile.findMany();
  console.log('--- USERS IN DB ---');
  profiles.forEach(p => {
    console.log(`ID: ${p.id} | Email: '${p.email}' | Phone: '${p.phone}' | Hash: ${!!p.passwordHash}`);
  });
  console.log('-------------------');
}

main().finally(() => prisma.$disconnect());
