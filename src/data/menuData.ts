export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  tags?: string[];
  specs?: Record<string, string>;
}

export const menuItems: MenuItemData[] = [
  {
    id: 'sig-1',
    name: 'Azmar Special Mandi',
    description: 'Slow cooked tender lamb served on aromatic basmati rice with special spices.',
    price: '₹550',
    image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    category: 'signatures',
    tags: ['Best Seller', 'Signature'],
    specs: { portion: 'Full', serving: '2 Persons' }
  },
  {
    id: 'alfaham-1',
    name: 'Peri Peri Al Faham Chicken',
    description: 'Flame-grilled charcoal chicken marinated in spicy peri peri sauce.',
    price: '₹380',
    image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
    category: 'alfaham',
    tags: ['Best Seller', 'Spicy'],
    specs: { portion: 'Half / Full' }
  },
  {
    id: 'mandi-1',
    name: 'Chicken Mandi',
    description: 'Traditional Arabian style slow-cooked chicken on spiced long grain rice.',
    price: '₹340',
    image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
    category: 'mandi',
    tags: ['Classic'],
    specs: { portion: 'Full' }
  },
  {
    id: 'coastal-1',
    name: 'Coastal Prawn Roast',
    description: 'Fresh coastal prawns tossed in authentic Malabar roasted coconut gravy.',
    price: '₹460',
    image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg',
    category: 'coastal',
    tags: ['Signature', 'Seafood'],
    specs: { portion: 'Standard' }
  },
  {
    id: 'bev-1',
    name: 'Mint Lime Cooler',
    description: 'Refreshing cold beverage made with fresh mint leaves and freshly squeezed lime.',
    price: '₹90',
    image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg',
    category: 'beverages',
    tags: ['Refreshing'],
    specs: { size: '350 ml' }
  }
];
