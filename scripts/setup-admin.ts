import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { hashPassword } from '../api/lib/auth';
import { User, Config } from '../api/lib/models';
import defaultConfig from '../src/config/defaultPrices.json';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function setupAdmin() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await User.findOne({ isAdmin: true });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email || 'Not set');

      const answer = await askQuestion('Do you want to update the admin user? (yes/no): ');

      if (answer.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    // Pedir información del admin
    console.log('\n=== Admin User Setup ===\n');

    const username = await askQuestion('Enter admin username (default: admin): ') || 'admin';
    const password = await askQuestion('Enter admin password (min 8 characters): ');
    const email = await askQuestion('Enter admin email (optional, for notifications): ') || '';
    const name = await askQuestion('Enter admin name (optional): ') || 'Administrator';

    // Validar password
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Validar email si se proporcionó
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
    }

    // Check if email is already used by another user
    if (email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: existingAdmin?._id }
      });

      if (emailExists) {
        throw new Error(`Email ${email} is already registered to another user. Please use a different email.`);
      }
    }

    // Hash password
    console.log('\nHashing password...');
    const hashedPassword = await hashPassword(password);

    // Crear o actualizar usuario admin
    if (existingAdmin) {
      existingAdmin.username = username;
      existingAdmin.password = hashedPassword;
      existingAdmin.email = email || existingAdmin.email;
      existingAdmin.name = name || existingAdmin.name;
      existingAdmin.isAdmin = true;
      existingAdmin.emailVerified = true; // Admin doesn't need email verification
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully!');
    } else {
      await User.create({
        username,
        password: hashedPassword,
        email: email || undefined,
        name,
        isAdmin: true,
        emailVerified: true
      });
      console.log('✅ Admin user created successfully!');
    }

    // Verificar si existe configuración
    const existingConfig = await Config.findOne();

    if (!existingConfig) {
      console.log('Creating default configuration...');
      await Config.create({
        rawMaterials: defaultConfig.rawMaterials,
        markup: defaultConfig.markup,
        customPrices: defaultConfig.customPrices
      });
      console.log('✅ Default configuration created!');
    } else {
      console.log('Configuration already exists, skipping...');
    }

    console.log('\n=================================');
    console.log('Setup completed successfully! 🎉');
    console.log('=================================');
    console.log('Admin User Details:');
    console.log('  Username:', username);
    console.log('  Name:', name);
    console.log('  Email:', email || 'Not set');
    console.log('  Password: ******** (you just entered it)');
    console.log('  Is Admin: true');
    console.log('  Email Verified: true');
    console.log('\nYou can now login at /login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Helper para leer input del usuario
async function askQuestion(question: string): Promise<string> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

setupAdmin();
