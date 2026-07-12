import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { menuItems } from '../src/data/menuData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Extract unique categories from menuItems
  const categorySet = new Set<string>();
  menuItems.forEach(item => categorySet.add(item.category));
  
  const categoryNames: Record<string, string> = {
    'signatures': 'Signatures',
    'alfaham': 'Al Faham',
    'mandi': 'Mandi',
    'coastal': 'Coastal',
    'beverages': 'Beverages'
  };

  const categoryImages: Record<string, string> = {
    'signatures': '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    'alfaham': '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
    'mandi': '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
    'coastal': '/product-images/pexels-ali-dashti-506667798-17650193.jpg',
    'beverages': '/product-images/pexels-ali-dashti-506667798-17696657.jpg'
  };

  // Seed Categories
  for (const catId of Array.from(categorySet)) {
    await prisma.category.upsert({
      where: { id: catId },
      update: {},
      create: {
        id: catId,
        name: categoryNames[catId] || catId,
        image: categoryImages[catId] || '',
      }
    });
  }

  // Seed Menu Items
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        tags: item.tags || [],
        specs: item.specs ? JSON.stringify(item.specs) : null,
        categoryId: item.category
      },
      create: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        tags: item.tags || [],
        specs: item.specs ? JSON.stringify(item.specs) : null,
        categoryId: item.category
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
