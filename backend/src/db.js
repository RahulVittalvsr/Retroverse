import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: undefined,
  });
  isConnected = true;
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}

