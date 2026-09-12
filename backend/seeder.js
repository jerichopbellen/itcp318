const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const User = require('./models/user');
const Product = require('./models/product');
const Order = require('./models/order');

dotenv.config({ path: './config/.env' });

const seedDatabase = async () => {
  try {
    await connectDatabase();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const users = [];

    users.push(
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        avatar: {
          public_id: 'samples/people/boy-snow-hoodie',
          url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099127/samples/people/boy-snow-hoodie.jpg'
        },
        role: 'admin'
      })
    );

    users.push(
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        avatar: {
          public_id: 'samples/people/kitchen-bar',
          url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099126/samples/people/kitchen-bar.jpg'
        }
      })
    );

    users.push(
      await User.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        avatar: {
          public_id: 'samples/people/smiling-man',
          url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099126/samples/people/smiling-man.jpg'
        }
      })
    );

    const products = await Product.insertMany([
      {
        name: 'iPhone 15',
        price: 999,
        description: 'Latest Apple smartphone with a powerful camera and premium design.',
        images: [
          {
            public_id: 'samples/ecommerce/analog-classic',
            url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099124/samples/ecommerce/analog-classic.jpg'
          }
        ],
        category: 'Electronics',
        seller: 'Apple',
        stock: 25
      },
      {
        name: 'MacBook Pro',
        price: 899,
        description: 'High-performance laptop for work and creative projects.',
        images: [
          {
            public_id: 'samples/ecommerce/leather-bag-gray',
            url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099128/samples/ecommerce/leather-bag-gray.jpg'
          }
        ],
        category: 'Laptops',
        seller: 'Apple',
        stock: 10
      },
      {
        name: 'Sony Headphones',
        price: 199,
        description: 'Wireless noise-cancelling headphones with premium sound quality.',
        images: [
          {
            public_id: 'samples/ecommerce/shoes',
            url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099125/samples/ecommerce/shoes.jpg'
          }
        ],
        category: 'Headphones',
        seller: 'Sony',
        stock: 50
      },
      {
        name: 'Nike Running Shoes',
        price: 120,
        description: 'Comfortable running shoes for daily training and outdoor use.',
        images: [
          {
            public_id: 'samples/ecommerce/car-interior-design',
            url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099125/samples/ecommerce/car-interior-design.jpg'
          }
        ],
        category: 'Clothes/Shoes',
        seller: 'Nike',
        stock: 40
      }
    ]);

    await Order.insertMany([
      {
        shippingInfo: {
          address: '123 Main St',
          city: 'Quezon City',
          phoneNo: '09171234567',
          postalCode: '1100',
          country: 'Philippines'
        },
        user: users[1]._id,
        orderItems: [
          {
            name: products[0].name,
            quantity: 1,
            image: products[0].images[0].url,
            price: products[0].price,
            product: products[0]._id
          },
          {
            name: products[2].name,
            quantity: 2,
            image: products[2].images[0].url,
            price: products[2].price,
            product: products[2]._id
          }
        ],
        paymentInfo: {
          id: 'pay_001',
          status: 'paid'
        },
        paidAt: Date.now(),
        itemsPrice: products[0].price + products[2].price * 2,
        taxPrice: 100,
        shippingPrice: 50,
        totalPrice: products[0].price + products[2].price * 2 + 150,
        orderStatus: 'Processing'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();