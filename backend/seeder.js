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

    users.push(
      await User.create({
        name: 'Michael Johnson',
        email: 'michael@example.com',
        password: 'password123',
        avatar: {
          public_id: 'samples/people/man',
          url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099126/samples/people/man.jpg'
        }
      })
    );

    users.push(
      await User.create({
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: 'password123',
        avatar: {
          public_id: 'samples/people/woman',
          url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099126/samples/people/woman.jpg'
        }
      })
    );

    const products = await Product.insertMany([
      {
        name: 'iPhone 15',
        price: 999,
        description:
          'Latest Apple smartphone with a powerful camera and premium design.',
        images: [
          {
            public_id: 'samples/ecommerce/analog-classic',
            url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099124/samples/ecommerce/analog-classic.jpg'
          }
        ],
        category: 'Electronics',
        seller: 'Apple',
        stock: 25,
        user: users[0]._id
      },
      {
        name: 'MacBook Pro',
        price: 899,
        description:
          'High-performance laptop for work and creative projects.',
        images: [
          {
            public_id: 'samples/ecommerce/leather-bag-gray',
            url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099128/samples/ecommerce/leather-bag-gray.jpg'
          }
        ],
        category: 'Laptops',
        seller: 'Apple',
        stock: 10,
        user: users[0]._id
      },
      {
        name: 'Sony Headphones',
        price: 199,
        description:
          'Wireless noise-cancelling headphones with premium sound quality.',
        images: [
          {
            public_id: 'samples/ecommerce/shoes',
            url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099125/samples/ecommerce/shoes.jpg'
          }
        ],
        category: 'Headphones',
        seller: 'Sony',
        stock: 50,
        user: users[0]._id
      },
      {
        name: 'Nike Running Shoes',
        price: 120,
        description:
          'Comfortable running shoes for daily training and outdoor use.',
        images: [
          {
            public_id: 'samples/ecommerce/car-interior-design',
            url: 'https://res.cloudinary.com/nfo2q1jw/image/upload/v1789099125/samples/ecommerce/car-interior-design.jpg'
          }
        ],
        category: 'Clothes/Shoes',
        seller: 'Nike',
        stock: 40,
        user: users[0]._id
      }
    ]);

    const createOrderItem = (product, quantity) => ({
      name: product.name,
      quantity,
      image: product.images[0].url,
      price: product.price,
      product: product._id
    });

    const calculateItemsPrice = (orderItems) =>
      orderItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

    const createOrder = ({
      user,
      orderItems,
      city,
      address,
      postalCode,
      phoneNo,
      country = 'Philippines',
      paymentId,
      orderStatus = 'Processing',
      deliveredAt = null
    }) => {
      const itemsPrice = calculateItemsPrice(orderItems);
      const taxPrice = Number((itemsPrice * 0.1).toFixed(2));
      const shippingPrice = itemsPrice >= 1000 ? 0 : 50;
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      return {
        shippingInfo: {
          address,
          city,
          phoneNo,
          postalCode,
          country
        },
        user,
        orderItems,
        paymentInfo: {
          id: paymentId,
          status: 'paid'
        },
        paidAt: new Date(),
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        orderStatus,
        deliveredAt
      };
    };

    const orders = await Order.insertMany([
      createOrder({
        user: users[1]._id,
        orderItems: [
          createOrderItem(products[0], 1),
          createOrderItem(products[2], 2)
        ],
        address: '123 Main St',
        city: 'Quezon City',
        postalCode: '1100',
        phoneNo: '09171234567',
        paymentId: 'pay_001',
        orderStatus: 'Delivered',
        deliveredAt: new Date('2026-08-15')
      }),

      createOrder({
        user: users[2]._id,
        orderItems: [
          createOrderItem(products[1], 1),
          createOrderItem(products[3], 1)
        ],
        address: '45 Mabini Street',
        city: 'Manila',
        postalCode: '1000',
        phoneNo: '09181234567',
        paymentId: 'pay_002',
        orderStatus: 'Delivered',
        deliveredAt: new Date('2026-08-20')
      }),

      createOrder({
        user: users[3]._id,
        orderItems: [
          createOrderItem(products[0], 1)
        ],
        address: '88 Rizal Avenue',
        city: 'Pasig',
        postalCode: '1600',
        phoneNo: '09191234567',
        paymentId: 'pay_003',
        orderStatus: 'Delivered',
        deliveredAt: new Date('2026-08-25')
      }),

      createOrder({
        user: users[4]._id,
        orderItems: [
          createOrderItem(products[2], 1),
          createOrderItem(products[3], 2)
        ],
        address: '12 Bonifacio Drive',
        city: 'Makati',
        postalCode: '1200',
        phoneNo: '09201234567',
        paymentId: 'pay_004',
        orderStatus: 'Delivered',
        deliveredAt: new Date('2026-08-28')
      }),

      createOrder({
        user: users[1]._id,
        orderItems: [
          createOrderItem(products[1], 1),
          createOrderItem(products[3], 1)
        ],
        address: '123 Main St',
        city: 'Quezon City',
        postalCode: '1100',
        phoneNo: '09171234567',
        paymentId: 'pay_005',
        orderStatus: 'Shipped'
      }),

      createOrder({
        user: users[2]._id,
        orderItems: [
          createOrderItem(products[0], 1),
          createOrderItem(products[2], 1)
        ],
        address: '45 Mabini Street',
        city: 'Manila',
        postalCode: '1000',
        phoneNo: '09181234567',
        paymentId: 'pay_006',
        orderStatus: 'Processing'
      })
    ]);

    await Product.findByIdAndUpdate(products[0]._id, {
      $set: {
        ratings: 4.5,
        numOfReviews: 2,
        reviews: [
          {
            user: users[1]._id,
            name: users[1].name,
            rating: 5,
            comment: 'The iPhone arrived quickly and works perfectly.'
          },
          {
            user: users[3]._id,
            name: users[3].name,
            rating: 4,
            comment: 'Great phone and excellent camera quality.'
          }
        ]
      }
    });

    await Product.findByIdAndUpdate(products[1]._id, {
      $set: {
        ratings: 5,
        numOfReviews: 1,
        reviews: [
          {
            user: users[2]._id,
            name: users[2].name,
            rating: 5,
            comment: 'The MacBook is fast, reliable, and perfect for work.'
          }
        ]
      }
    });

    await Product.findByIdAndUpdate(products[2]._id, {
      $set: {
        ratings: 4.5,
        numOfReviews: 2,
        reviews: [
          {
            user: users[1]._id,
            name: users[1].name,
            rating: 5,
            comment: 'Very comfortable headphones with great sound.'
          },
          {
            user: users[4]._id,
            name: users[4].name,
            rating: 4,
            comment: 'The noise cancellation works well.'
          }
        ]
      }
    });

    await Product.findByIdAndUpdate(products[3]._id, {
      $set: {
        ratings: 4.5,
        numOfReviews: 2,
        reviews: [
          {
            user: users[2]._id,
            name: users[2].name,
            rating: 4,
            comment: 'Comfortable shoes for running and daily exercise.'
          },
          {
            user: users[4]._id,
            name: users[4].name,
            rating: 5,
            comment: 'The shoes fit perfectly and are very comfortable.'
          }
        ]
      }
    });

    console.log(
      `Database seeded successfully with ${users.length} users, ${products.length} products, ${orders.length} orders, and product reviews.`
    );

    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();