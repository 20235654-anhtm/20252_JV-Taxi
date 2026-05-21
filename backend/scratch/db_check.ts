import prisma from '../src/config/db';

async function main() {
  const usersWithPayments = await prisma.profile.findMany({
    where: {
      paymentMethods: {
        some: {} // Find profiles that have at least one payment method
      }
    },
    include: { paymentMethods: true }
  });
  console.log('Profiles with payment methods:', JSON.stringify(usersWithPayments, null, 2));

  const allPayments = await prisma.paymentMethod.findMany();
  console.log('All payment methods in DB:', JSON.stringify(allPayments, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
