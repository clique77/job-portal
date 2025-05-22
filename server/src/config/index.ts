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
    directory: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE || '5242880', 10),
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME || ''
  }
}

export default config;
