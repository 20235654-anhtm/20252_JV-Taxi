import prisma from './config/db';

async function main() {
  const userId = 'e5ef9025-0de0-49e0-9c7a-25ae17aac6ff';
  console.log('Testing prisma update on driverProfile...');
  try {
    const updated = await prisma.driverProfile.update({
      where: { userId },
      data: {
        avatarPicture: 'https://test-avatar-url.com/avatar.jpg'
      }
    });
    console.log('✅ Update succeeded!', updated);
  } catch (err: any) {
    console.error('❌ Update failed with error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
