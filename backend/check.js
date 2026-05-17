// check.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany({
    include: { driverProfile: true },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log(JSON.stringify(profiles, null, 2));
}

main().finally(() => prisma.$disconnect());
