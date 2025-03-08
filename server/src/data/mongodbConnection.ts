import mongoose from 'mongoose';
import config from '../config';

class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      await mongoose.connect(config.mongoUri);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected successfully');
    } catch (error) {
      console.error('MongoDB disconnection failed:', error);
      process.exit(1);
    }
  }
}

export default Database.getInstance();
