import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const roles = await Promise.all(
    (['administrador', 'cajero', 'mozo'] as RoleName[]).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const roleByName = Object.fromEntries(roles.map((role) => [role.name, role]));
  const users = [
    { name: 'Valeria Ramos', email: 'admin@vecopa.pe', password: 'Admin123!', role: 'administrador' as RoleName },
    { name: 'Caja Norte', email: 'caja@vecopa.pe', password: 'Caja123!', role: 'cajero' as RoleName },
    { name: 'Mozo Patio', email: 'mozo@vecopa.pe', password: 'Mozo123!', role: 'mozo' as RoleName },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        passwordHash: await bcrypt.hash(user.password, 10),
        roleId: roleByName[user.role].id,
      },
    });
  }

  const categoryData = [
    { name: 'Cafe', color: '#0f766e' },
    { name: 'Comida', color: '#e11d48' },
    { name: 'Bar', color: '#2563eb' },
    { name: 'Postres', color: '#ca8a04' },
  ];

  const categories = [];
  for (const category of categoryData) {
    const existing = await prisma.category.findFirst({ where: { name: category.name } });
    categories.push(existing ?? (await prisma.category.create({ data: category })));
  }

  const byName = Object.fromEntries(categories.map((category) => [category.name, category]));
  const productData = [
    { name: 'Americano', categoryId: byName.Cafe.id, price: 8.5, stock: 45 },
    { name: 'Capuccino', categoryId: byName.Cafe.id, price: 11, stock: 38 },
    { name: 'Hamburguesa casa', categoryId: byName.Comida.id, price: 28, stock: 20 },
    { name: 'Lomo saltado', categoryId: byName.Comida.id, price: 34, stock: 16 },
    { name: 'Chilcano', categoryId: byName.Bar.id, price: 24, stock: 28 },
    { name: 'Cheesecake', categoryId: byName.Postres.id, price: 15, stock: 12 },
  ];

  for (const product of productData) {
    const exists = await prisma.product.findFirst({ where: { name: product.name } });
    if (!exists) await prisma.product.create({ data: product });
  }

  const tableData = [
    { name: 'Mesa 1', capacity: 2, status: 'ocupada' as const },
    { name: 'Mesa 2', capacity: 4, status: 'libre' as const },
    { name: 'Terraza 1', capacity: 4, status: 'reservada' as const },
    { name: 'Barra', capacity: 6, status: 'ocupada' as const },
    { name: 'Mesa 5', capacity: 2, status: 'libre' as const },
    { name: 'Salon 2', capacity: 8, status: 'libre' as const },
  ];

  for (const table of tableData) {
    const exists = await prisma.diningTable.findFirst({ where: { name: table.name } });
    if (!exists) await prisma.diningTable.create({ data: table });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
