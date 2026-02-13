import { MongoClient } from 'mongodb';

if (!process.env.MY_MONGODB_URI) {
  throw new Error('Please add your MY_MONGODB_URI to .env.local');
}

const uri = process.env.MY_MONGODB_URI;
let client: MongoClient | null = null;

export async function connectDB() {
  if (client) {
    return client;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB connected');
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getDB() {
  if (!client) {
    await connectDB();
  }
  return client!.db(process.env.MONGODB_DB || 'mind-extension');
}
