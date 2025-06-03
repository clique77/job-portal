import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const rootDir = path.resolve(__dirname, '../../..');

const uploadsDir = path.join(rootDir, 'uploads');

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/job-portal',
  jwtSecret: process.env.JWT_SECRET || process.env.JWT_FALLBACK_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieSecret: process.env.COOKIE_SECRET || process.env.COOKIE_FALLBACK_SECRET,
  uploads: {
    directory: uploadsDir,
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE || '5242880', 10),
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME || ''
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@jobportal.com'
  }
}

console.log('Final uploads directory:', config.uploads.directory);
console.log('SMTP config:', config.smtp);

export default config;
