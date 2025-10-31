import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewData() {
  try {
    console.log('\n=== USERS ===');
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    console.log(`Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.profile?.name || 'No profile'})`);
    });

    console.log('\n=== PROFILES ===');
    const profiles = await prisma.profile.findMany();
    console.log(`Total profiles: ${profiles.length}`);
    profiles.forEach(profile => {
      console.log(`- ${profile.name}, ${profile.age}, ${profile.gender}`);
      console.log(`  Photos: ${profile.photos.length}`);
      console.log(`  Interests: ${profile.interests.join(', ')}`);
    });

    console.log('\n=== MATCHES ===');
    const matches = await prisma.match.findMany({
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } },
      },
    });
    console.log(`Total matches: ${matches.length}`);
    matches.forEach(match => {
      console.log(`- ${match.user1.profile?.name} ↔ ${match.user2.profile?.name}`);
    });

    console.log('\n=== MESSAGES ===');
    const messages = await prisma.message.findMany({
      include: {
        sender: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    console.log(`Total messages: ${await prisma.message.count()}`);
    console.log('Latest 10 messages:');
    messages.forEach(msg => {
      console.log(`- ${msg.sender.profile?.name}: ${msg.content.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewData();
