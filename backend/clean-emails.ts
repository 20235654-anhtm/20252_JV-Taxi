import prisma from './src/config/db';

async function main() {
  const profiles = await prisma.profile.findMany();
  for (const p of profiles) {
    if (p.email && (p.email !== p.email.trim().toLowerCase())) {
      console.log('Updating', p.email);
      await prisma.profile.update({
        where: { id: p.id },
        data: { email: p.email.trim().toLowerCase() }
      });
    }
  }
  console.log('Done cleaning emails');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
