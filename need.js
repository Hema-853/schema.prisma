import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create mock users
  const alice = await prisma.user.upsert({
    where: { id: 'alice-id' },
    update: {},
    create: {
      id: 'alice-id',
      name: 'Alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: 'bob-id' },
    update: {},
    create: {
      id: 'bob-id',
      name: 'Bob',
    },
  });

  console.log('Seed data created:', { alice, bob });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });