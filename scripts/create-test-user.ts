import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('test123', 12);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password,
      firstName: 'Test',
      lastName: 'User',
    },
  });

  console.log('Created test user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 