import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/job-portal',
  jwtSecret: process.env.JWT_SECRET || process.env.JWT_FALLBACK_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieSecret: process.env.COOKIE_SECRET || process.env.COOKIE_FALLBACK_SECRET,
  uploads: {
    directory: path.join(__dirname, '../../../uploads'),
    maxSize: 10 * 1024 * 1024,
  }
}

export default config;
