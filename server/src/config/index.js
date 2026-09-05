import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 5000),
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smooth',
  mongoOptions: {
    serverSelectionTimeoutMS: 3000
  },
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 10),
  cloudinaryUrl: process.env.CLOUDINARY_URL || '',
  // Payment gateways (placeholders until BE-11 integration)
  mtnApi: { base: process.env.MTN_API_BASE || '', key: process.env.MTN_API_KEY || '' },
  orangeApi: { base: process.env.ORANGE_API_BASE || '', key: process.env.ORANGE_API_KEY || '' }
};