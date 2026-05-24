import prisma from './src/config/db';

async function test() {
  try {
    const rideId = '00000000-0000-0000-0000-000000000000';
    const senderId = '00000000-0000-0000-0000-000000000000';
    
    console.log('Testing create message...');
    const message = await prisma.message.create({
        data: {
            rideId,
            senderId,
            text: 'hello'
        }
    });
    console.log('Success!', message);
  } catch (err: any) {
    console.error('Failed!', err.message);
  } finally {
    process.exit(0);
  }
}
test();
