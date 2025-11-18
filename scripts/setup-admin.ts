import mongoose from 'mongoose';
import { hashPassword } from '../api/lib/auth';
import { User, Config } from '../api/lib/models';
import defaultConfig from '../src/config/defaultPrices.json';

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
    const existingUser = await User.findOne({ username: 'admin' });

    if (existingUser) {
      console.log('⚠️  Admin user already exists!');
      console.log('Username:', existingUser.username);

      const answer = await askQuestion('Do you want to reset the password? (yes/no): ');

      if (answer.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    // Pedir username y password
    const username = await askQuestion('Enter admin username (default: admin): ') || 'admin';
    const password = await askQuestion('Enter admin password: ');

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);

    // Crear o actualizar usuario
    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.username = username;
      await existingUser.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      await User.create({
        username,
        password: hashedPassword
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
    console.log('Username:', username);
    console.log('Password: ******** (you just entered it)');
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Helper para leer input del usuario
function askQuestion(question: string): Promise<string> {
  const readline = require('readline');
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
