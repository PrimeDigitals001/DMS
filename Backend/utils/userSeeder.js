import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});

    // Create test users
    const users = [
      {
        name: 'Super Administrator',
        email: 'superadmin@example.com',
        phoneNumber: '1234567890',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'super_admin',
        clientId: null // Super admin has no client
      },
      {
        name: 'Administrator',
        email: 'admin@example.com',
        phoneNumber: '1234567891',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'admin',
        clientId: null // You can set a specific client ID here if needed
      },
      {
        name: 'Staff Member',
        email: 'staff@example.com',
        phoneNumber: '1234567892',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'admin', // Using admin role for staff (you can change this)
        clientId: null
      }
    ];

    // Insert users
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('User seeding completed!');
    console.log('\nTest Credentials:');
    console.log('Super Admin: superadmin@example.com / password123');
    console.log('Admin: admin@example.com / password123');
    console.log('Staff: staff@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
