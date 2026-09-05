import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/index.js';

async function bootstrap() {
  try {
    await mongoose.connect(config.mongoUri, config.mongoOptions);
    console.log('MongoDB connected:', config.mongoUri);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
  }
  app.listen(config.port, () =>
    console.log(`SMOOTH API running on port ${config.port} (${config.env})`)
  );
}

bootstrap();