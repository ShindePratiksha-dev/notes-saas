const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Example: Create a test user
  await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  console.log("✅ Database seeded!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
