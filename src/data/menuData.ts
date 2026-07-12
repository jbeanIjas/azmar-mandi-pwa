export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: 'signatures' | 'alfaham' | 'mandi' | 'coastal' | 'beverages';
  tags?: string[];
  specs?: { label: string; value: string }[];
}

export const menuItems: MenuItem[] = [
  // --- AZMAR SIGNATURES ---
  {
    id: 'shawaya-mandi',
    name: 'The Azmar Shawaya',
    description: 'Our crown jewel. A whole slow-roasted chicken, deeply marinated in our secret copper spice rub, spinning over charcoal until perfectly golden. Served on premium basmati rice.',
    price: '₹1499',
    image: '/product-images/pexels-ali-dashti-506667798-17649393.jpg',
    category: 'signatures',
    tags: ['Signature', 'Charcoal Roasted'],
    specs: [{ label: 'Servings', value: '1-2 Persons' }]
  },
  {
    id: 'black-gold-beef',
    name: 'Black Gold Beef Mandi',
    description: 'Premium beef chunks marinated in dark Arabian spices and slow-cooked in our underground pit for 12 hours until melt-in-the-mouth tender.',
    price: '₹2199',
    image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    category: 'signatures',
    tags: ['Premium', 'Slow Pit-Baked'],
    specs: [{ label: 'Servings', value: '1-2 Persons' }]
  },
  {
    id: 'crown-jewel-mutton',
    name: 'Crown Jewel Mutton Mandi',
    description: 'The royal feast. Succulent cuts of prime Australian lamb, infused with saffron and cooked till they fall off the bone, resting on fragrant Mandi rice.',
    price: '₹2299',
    image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
    category: 'signatures',
    tags: ['Best Seller', 'Saffron Infused'],
    specs: [{ label: 'Servings', value: '2 Persons' }]
  },
  {
    id: 'pearl-coast-fish',
    name: 'Pearl Coast Fish Mandi',
    description: 'Fresh Gulf catch, marinated in coastal herbs and grilled over a gentle charcoal flame to preserve its delicate, flaky texture.',
    price: '₹1899',
    image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg',
    category: 'signatures',
    tags: ['Fresh Catch', 'Coastal'],
    specs: [{ label: 'Servings', value: '1 Person' }]
  },

  // --- AZMAR FLAME HOUSE (Al Faham Collection) ---
  {
    id: 'classic-alfaham',
    name: 'Classic Al Faham',
    description: 'The iconic Arabian charcoal-grilled chicken. Smoky, perfectly charred on the outside and incredibly juicy inside.',
    price: '₹1299',
    image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
    category: 'alfaham',
    tags: ['Classic', 'Smoky']
  },
  {
    id: 'peri-peri-alfaham',
    name: 'Peri Peri Inferno Al Faham',
    description: 'For the brave. Charcoal-grilled chicken slathered in our fiery house-made African bird\'s eye chili and garlic peri peri sauce.',
    price: '₹1399',
    image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg',
    category: 'alfaham',
    tags: ['Spicy', 'Fiery']
  },
  {
    id: 'honey-chili-alfaham',
    name: 'Honey Chili Glaze Al Faham',
    description: 'A beautiful balance of heat and sweet. Sticky natural honey glazed over chili-rubbed chicken grilling on hot coals.',
    price: '₹1450',
    image: '/product-images/pexels-ali-dashti-506667798-27359368.jpg',
    category: 'alfaham',
    tags: ['Sweet & Spicy', 'Glazed']
  },
  {
    id: 'green-fire-alfaham',
    name: 'Green Fire Al Faham',
    description: 'Marinated in a vibrant blend of fresh mint, coriander, green chilies, and olive oil for a refreshing, herby punch.',
    price: '₹1399',
    image: '/product-images/pexels-ali-dashti-506667798-17649393.jpg',
    category: 'alfaham',
    tags: ['Herby', 'Fresh']
  },
  {
    id: 'cracked-pepper-alfaham',
    name: 'Cracked Pepper Al Faham',
    description: 'Coated in robust, freshly cracked black peppercorns and sea salt, delivering a sharp, aromatic spice profile.',
    price: '₹1399',
    image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    category: 'alfaham',
    tags: ['Peppery', 'Bold']
  },
  {
    id: 'afghani-silk-alfaham',
    name: 'Afghani Silk Al Faham',
    description: 'An incredibly rich and creamy marinade made from cashews, cream, and mild spices. Silky smooth and gentle on the palate.',
    price: '₹1499',
    image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
    category: 'alfaham',
    tags: ['Creamy', 'Mild']
  },
  {
    id: 'turkish-spice-alfaham',
    name: 'Turkish Spice Al Faham',
    description: 'Infused with authentic Ottoman spices, sumac, and sweet paprika, offering a deep red hue and complex Mediterranean flavor.',
    price: '₹1450',
    image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg',
    category: 'alfaham',
    tags: ['Mediterranean', 'Spiced']
  },
  {
    id: 'mexican-heat-alfaham',
    name: 'Mexican Heat Al Faham',
    description: 'A fusion masterpiece. Marinated in chipotle peppers, smoked paprika, and lime, bringing a zesty Latin heat to Arabian charcoal.',
    price: '₹1450',
    image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
    category: 'alfaham',
    tags: ['Fusion', 'Zesty']
  },
  {
    id: 'creamy-velvet-alfaham',
    name: 'Creamy Velvet Al Faham',
    description: 'A decadent preparation where the chicken is bathed in a luxurious cream and cheese marinade before hitting the grill.',
    price: '₹1499',
    image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg',
    category: 'alfaham',
    tags: ['Decadent', 'Rich']
  },

  // --- AZMAR MANDI SELECTION ---
  {
    id: 'classic-chicken-mandi',
    name: 'Classic Chicken Mandi',
    description: 'The traditional staple. Tender chicken cooked underground in a tandoor with our signature spice blend.',
    price: '₹1199',
    image: '/product-images/pexels-ali-dashti-506667798-27359368.jpg',
    category: 'mandi',
    tags: ['Traditional', 'Authentic']
  },
  {
    id: 'traditional-mutton-mandi',
    name: 'Traditional Mutton Mandi',
    description: 'Classic slow-cooked mutton, retaining all its juices, served over a massive bed of spiced rice.',
    price: '₹1899',
    image: '/product-images/pexels-ali-dashti-506667798-17649393.jpg',
    category: 'mandi',
    tags: ['Juicy', 'Classic']
  },
  {
    id: 'royal-mutton-ribs-mandi',
    name: 'Royal Mutton Ribs Mandi',
    description: 'The most prized cut. Slow-roasted mutton ribs that pull apart effortlessly, infused with cardamom and cloves.',
    price: '₹2499',
    image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    category: 'mandi',
    tags: ['Premium Cut', 'Tender']
  },
  {
    id: 'premium-beef-mandi',
    name: 'Premium Beef Mandi',
    description: 'Select cuts of prime beef, slow-baked until perfectly tender, offering a rich, robust flavor profile.',
    price: '₹1999',
    image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
    category: 'mandi',
    tags: ['Robust', 'Savory']
  },
  {
    id: 'smoked-beef-ribs-mandi',
    name: 'Smoked Beef Ribs Mandi',
    description: 'Colossal beef ribs smoked for 14 hours over applewood, glazed with a dark spiced reduction.',
    price: '₹2699',
    image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg',
    category: 'mandi',
    tags: ['Smoked', 'Colossal']
  },

  // --- AZMAR COASTAL SIGNATURES ---
  {
    id: 'coastal-flame-grill',
    name: 'Coastal Flame Grill',
    description: 'A whole fish of the day, split open and grilled directly over open flames with a fiery red coastal marinade.',
    price: '₹2199',
    image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
    category: 'coastal',
    tags: ['Fiery', 'Catch of the Day']
  },
  {
    id: 'heritage-pollichath',
    name: 'Heritage Pollichath',
    description: 'A traditional delicacy where fish is wrapped in banana leaves with a rich shallot and spice masala, then baked.',
    price: '₹2299',
    image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg',
    category: 'coastal',
    tags: ['Banana Leaf', 'Traditional']
  },
  {
    id: 'smokehouse-chuttath',
    name: 'Smokehouse Chuttath',
    description: 'Intensely smoked fish using coconut shells and aromatic wood, delivering an unforgettable, deep coastal flavor.',
    price: '₹2150',
    image: '/product-images/pexels-ali-dashti-506667798-27359368.jpg',
    category: 'coastal',
    tags: ['Deep Smoke', 'Aromatic']
  },
  {
    id: 'golden-catch-fry',
    name: 'Golden Catch Fry',
    description: 'Crispy, golden-fried fish marinated in a simple, traditional spice mix to let the freshness of the catch shine.',
    price: '₹1899',
    image: '/product-images/pexels-ali-dashti-506667798-17649393.jpg',
    category: 'coastal',
    tags: ['Crispy', 'Classic']
  },

  // --- FRESH JUICES & COOLERS ---
  {
    id: 'orange-juice',
    name: 'Fresh Orange Juice',
    description: '100% freshly squeezed Valencia oranges, chilled to perfection.',
    price: '₹299',
    image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    category: 'beverages'
  },
  {
    id: 'mango-juice',
    name: 'Fresh Mango Juice',
    description: 'Thick, luscious juice extracted from seasonal sweet mangoes.',
    price: '₹349',
    image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
    category: 'beverages'
  },
  {
    id: 'pineapple-juice',
    name: 'Pineapple Juice',
    description: 'Refreshing and tart, freshly pressed tropical pineapples.',
    price: '₹299',
    image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg',
    category: 'beverages'
  },
  {
    id: 'watermelon-juice',
    name: 'Watermelon Juice',
    description: 'The ultimate thirst quencher. Sweet, hydrating, and freshly blended.',
    price: '₹250',
    image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
    category: 'beverages'
  },
  {
    id: 'avocado-shake',
    name: 'Avocado Shake',
    description: 'A rich, creamy Arabian favorite blended with milk and a touch of honey.',
    price: '₹399',
    image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg',
    category: 'beverages'
  },
  {
    id: 'banana-shake',
    name: 'Banana Shake',
    description: 'Classic, smooth, and sweet blended banana with premium milk.',
    price: '₹299',
    image: '/product-images/pexels-ali-dashti-506667798-27359368.jpg',
    category: 'beverages'
  },
  {
    id: 'strawberry-shake',
    name: 'Strawberry Shake',
    description: 'Creamy and sweet, made with fresh strawberries and vanilla ice cream.',
    price: '₹349',
    image: '/product-images/pexels-ali-dashti-506667798-17649393.jpg',
    category: 'beverages'
  },
  {
    id: 'mango-milkshake',
    name: 'Mango Milkshake',
    description: 'A decadent blend of fresh mango pulp, milk, and cream.',
    price: '₹399',
    image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    category: 'beverages'
  },
  {
    id: 'chocolate-shake',
    name: 'Chocolate Shake',
    description: 'Rich Belgian chocolate blended with cold milk for a luscious treat.',
    price: '₹349',
    image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
    category: 'beverages'
  },
  {
    id: 'lime-juice',
    name: 'Fresh Lime Juice',
    description: 'Crisp, cold, and zesty fresh lime juice.',
    price: '₹199',
    image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg',
    category: 'beverages'
  },
  {
    id: 'mint-lime-cooler',
    name: 'Mint Lime Cooler',
    description: 'Blended fresh mint and lime over crushed ice.',
    price: '₹249',
    image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
    category: 'beverages'
  },
  {
    id: 'mojito-collection',
    name: 'Mojito Collection',
    description: 'Your choice of classic, strawberry, or passionfruit virgin mojitos.',
    price: '₹299',
    image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg',
    category: 'beverages'
  }
];
