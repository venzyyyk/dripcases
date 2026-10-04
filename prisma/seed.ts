import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminPass = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dripcases.ru" },
    update: {},
    create: {
      email: "admin@dripcases.ru",
      passwordHash: adminPass,
      name: "Администратор",
      role: Role.ADMIN,
      balance: 0,
    },
  });

  // Test user
  const userPass = await hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "test@dripcases.ru" },
    update: {},
    create: {
      email: "test@dripcases.ru",
      passwordHash: userPass,
      name: "Тестовый пользователь",
      role: Role.USER,
      balance: 50000_00, // 50 000 ₽
    },
  });

  // Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Худи Oversize Black",
        brand: "DROPCASE",
        description: "Утеплённое худи оверсайз, 100% хлопок",
        size: "L",
        color: "Чёрный",
        price: 4500_00,
        sku: "HDI-BLK-001",
        stock: 10,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Кроссовки Air Street",
        brand: "URBANSTEP",
        description: "Лёгкие кроссовки для города",
        size: "43",
        color: "Белый",
        price: 8900_00,
        sku: "SNK-WHT-001",
        stock: 5,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Футболка Minimal Logo",
        brand: "DROPCASE",
        description: "Базовая футболка с минималистичным логотипом",
        size: "M",
        color: "Белый",
        price: 1800_00,
        sku: "TSH-WHT-001",
        stock: 25,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Куртка Bomber Premium",
        brand: "STREETWEAR CO",
        description: "Бомбер из экокожи, подкладка флис",
        size: "L",
        color: "Чёрный",
        price: 12000_00,
        sku: "JKT-BLK-001",
        stock: 3,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Штаны Cargo Wide",
        brand: "URBANSTEP",
        description: "Широкие карго-штаны с накладными карманами",
        size: "L",
        color: "Хаки",
        price: 5200_00,
        sku: "PNT-KHK-001",
        stock: 8,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Кепка Structured Cap",
        brand: "DROPCASE",
        description: "Структурированная кепка с вышивкой",
        size: "ONE SIZE",
        color: "Чёрный",
        price: 1200_00,
        sku: "CAP-BLK-001",
        stock: 30,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Носки Pack x3",
        brand: "DROPCASE",
        description: "Комплект из 3 пар спортивных носков",
        size: "42-44",
        color: "Мультиколор",
        price: 600_00,
        sku: "SCK-MIX-001",
        stock: 50,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Свитшот Heavy Cotton",
        brand: "STREETWEAR CO",
        description: "Плотный свитшот 380 gsm",
        size: "XL",
        color: "Серый",
        price: 3800_00,
        sku: "SWT-GRY-001",
        stock: 12,
        images: [],
      },
    }),
  ]);

  // Cases
  const basicCase = await prisma.case.create({
    data: {
      name: "BASIC",
      slug: "basic",
      description: "Базовый набор на каждый день",
      price: 3990_00,
      tag: "Хит",
      sortOrder: 1,
      image: null, // рендер грузится через админку,
    },
  });

  const urbanCase = await prisma.case.create({
    data: {
      name: "URBAN",
      slug: "urban",
      description: "Стиль большого города",
      price: 4990_00,
      tag: "Популярный",
      sortOrder: 2,
      image: null, // рендер грузится через админку,
    },
  });

  const sportCase = await prisma.case.create({
    data: {
      name: "SPORT",
      slug: "sport",
      description: "Комфорт и движение",
      price: 4490_00,
      sortOrder: 3,
      image: null, // рендер грузится через админку,
    },
  });

  const premiumCase = await prisma.case.create({
    data: {
      name: "PREMIUM",
      slug: "premium",
      description: "Премиум качество и уникальные вещи",
      price: 7990_00,
      sortOrder: 4,
      image: null, // рендер грузится через админку,
    },
  });

  const summerCase = await prisma.case.create({
    data: {
      name: "SUMMER",
      slug: "summer",
      description: "Лёгкость в каждом дне",
      price: 3490_00,
      sortOrder: 5,
      image: null, // рендер грузится через админку
    },
  });

  // CaseItems — привязки товаров к кейсам с шансами
  // BASIC: футболка (40%), носки (30%), кепка (20%), худи (10%)
  await prisma.caseItem.createMany({
    data: [
      { caseId: basicCase.id, productId: products[2].id, dropChance: 40 },
      { caseId: basicCase.id, productId: products[6].id, dropChance: 30 },
      { caseId: basicCase.id, productId: products[5].id, dropChance: 20 },
      { caseId: basicCase.id, productId: products[0].id, dropChance: 10 },
    ],
  });

  // URBAN: худи (25%), карго (25%), свитшот (20%), кроссовки (15%), бомбер (15%)
  await prisma.caseItem.createMany({
    data: [
      { caseId: urbanCase.id, productId: products[0].id, dropChance: 25 },
      { caseId: urbanCase.id, productId: products[4].id, dropChance: 25 },
      { caseId: urbanCase.id, productId: products[7].id, dropChance: 20 },
      { caseId: urbanCase.id, productId: products[1].id, dropChance: 15 },
      { caseId: urbanCase.id, productId: products[3].id, dropChance: 15 },
    ],
  });

  // SPORT: футболка (30%), носки (25%), кроссовки (25%), худи (20%)
  await prisma.caseItem.createMany({
    data: [
      { caseId: sportCase.id, productId: products[2].id, dropChance: 30 },
      { caseId: sportCase.id, productId: products[6].id, dropChance: 25 },
      { caseId: sportCase.id, productId: products[1].id, dropChance: 25 },
      { caseId: sportCase.id, productId: products[0].id, dropChance: 20 },
    ],
  });

  // PREMIUM: бомбер (30%), кроссовки (30%), свитшот (20%), худи (15%), карго (5%)
  await prisma.caseItem.createMany({
    data: [
      { caseId: premiumCase.id, productId: products[3].id, dropChance: 30 },
      { caseId: premiumCase.id, productId: products[1].id, dropChance: 30 },
      { caseId: premiumCase.id, productId: products[7].id, dropChance: 20 },
      { caseId: premiumCase.id, productId: products[0].id, dropChance: 15 },
      { caseId: premiumCase.id, productId: products[4].id, dropChance: 5 },
    ],
  });

  // SUMMER: футболка (35%), кепка (25%), носки (20%), карго (15%), кроссовки (5%)
  await prisma.caseItem.createMany({
    data: [
      { caseId: summerCase.id, productId: products[2].id, dropChance: 35 },
      { caseId: summerCase.id, productId: products[5].id, dropChance: 25 },
      { caseId: summerCase.id, productId: products[6].id, dropChance: 20 },
      { caseId: summerCase.id, productId: products[4].id, dropChance: 15 },
      { caseId: summerCase.id, productId: products[1].id, dropChance: 5 },
    ],
  });

  console.log("Seed complete:");
  console.log(`  Admin: admin@dripcases.ru / admin123`);
  console.log(`  User:  test@dripcases.ru / user123 (balance: 50 000 ₽)`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Cases: 5`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
