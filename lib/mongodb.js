import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = { maxPoolSize: 10 };

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db("kdf");
}

export default clientPromise;
