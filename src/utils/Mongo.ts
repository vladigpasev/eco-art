import { Db, MongoClient } from 'mongodb';

// Validate environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;
let cachedDb:Db = (null as any) as Db;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = await MongoClient.connect(uri, {
      
    });

    // Validate that the URL actually includes a database name
    const dbNameFromUri = new URL(uri).pathname.substr(1);
    if (!dbNameFromUri) {
      throw new Error('Database name must be defined in MONGODB_URI');
    }

    const db = client.db(dbNameFromUri);
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;
  }
}

// ES6-style export
export {
  connectToDatabase,
};
