import type { RestaurantProfile, Dish } from '@/types';

export const mockRestaurantProfile: RestaurantProfile = {
  id: 'websapmax-1',
  name: 'websapMax Restaurant',
  logoUrl: 'https://placehold.co/200x200.png?text=websapMax',
  address: '123 Foodie Lane, Flavor Town, FT 54321',
  phone: '+1 (555) 123-4567',
  email: 'contact@websapmax.com',
  description: 'Experience the best of culinary delights at websapMax. We offer a wide range of dishes made with the freshest ingredients, served in a warm and inviting atmosphere. Perfect for family dinners, friendly gatherings, and special occasions.',
  corporateColors: {
    primary: '#FF4500', // Vibrant red-orange
    secondary: '#FFF2E6', // Very light orange
    accent: '#FFB347', // Muted orange-yellow
  },
  socialLinks: {
    website: "https://www.websapmax.com",
    menuShareLink: "https://menu.websapmax.com",
    facebook: "https://facebook.com/websapmax",
    instagram: "https://instagram.com/websapmax",
    x: "https://x.com/websapmax",
    whatsapp: "https://wa.me/15551234567",
    tiktok: "https://tiktok.com/@websapmax",
    pinterest: "https://pinterest.com/websapmax"
  },
  paymentMethods: {
    codEnabled: true, // Cash on Delivery
    nequi: {
      enabled: true,
      nequiQrImageUrl: 'https://placehold.co/300x300.png?text=Nequi+QR',
      accountHolder: 'websapMax S.A.S',
      accountNumber: '3001234567'
    },
     daviplata: {
      enabled: true,
      daviplataQrImageUrl: 'https://placehold.co/300x300.png?text=Daviplata+QR',
      accountHolder: 'websapMax S.A.S',
      accountNumber: '3109876543'
    },
    bancolombia: {
      enabled: true,
      bancolombiaQrImageUrl: 'https://placehold.co/300x300.png?text=Bancolombia+QR',
      accountHolder: 'websapMax S.A.S',
      accountNumber: '123-456789-01'
    }
  }
};

export const mockDishes: Dish[] = [
  {
    id: 'dish-1',
    name: 'Sizzling Fajitas',
    description: 'Grilled strips of chicken or beef with bell peppers and onions, served with warm tortillas, salsa, and guacamole.',
    price: 18.99,
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 50,
    likes: 5,
    category: 'Main Courses',
    isFeatured: true,
    companyId: 'mock-company',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish-2',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, basil, and a rich tomato sauce on a crispy crust.',
    price: 14.50,
    imageUrl: 'https://placehold.co/600x400.png',
    stock: -1, // Unlimited
    likes: 4,
    category: 'Main Courses',
    companyId: 'mock-company',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish-3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, parmesan cheese, croutons, and a creamy Caesar dressing. Add chicken for $3.',
    price: 9.75,
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 100,
    likes: 4,
    category: 'Appetizers',
    companyId: 'mock-company',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish-4',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream and a raspberry coulis.',
    price: 8.00,
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 30,
    likes: 5,
    category: 'Desserts',
    isFeatured: true,
    companyId: 'mock-company',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish-5',
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta with pancetta, egg, pecorino romano cheese, and black pepper.',
    price: 16.25,
    imageUrl: 'https://placehold.co/600x400.png',
    stock: 0, // Out of stock
    likes: 3,
    category: 'Main Courses',
    companyId: 'mock-company',
    available: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish-6',
    name: 'Mango Tango Smoothie',
    description: 'A refreshing blend of ripe mangoes, yogurt, and a hint of lime.',
    price: 6.50,
    imageUrl: 'https://placehold.co/600x400.png',
    stock: -1,
    likes: 5,
    category: 'Drinks',
    companyId: 'mock-company',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
