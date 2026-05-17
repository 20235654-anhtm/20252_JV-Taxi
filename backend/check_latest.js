const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const latestProfile = await prisma.profile.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { driverProfile: true }
  });
  console.log(JSON.stringify(latestProfile, null, 2));
}

main().finally(() => prisma.$disconnect());
