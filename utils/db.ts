import mongoose from "mongoose";

interface Connection {
  isConnected?: number | boolean;
}

const connection: Connection = {};

async function connect() {
  if (connection.isConnected) {
    console.log("already connected");
    return;
  }
  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log("use previous connection");
      return;
    }
    // await mongoose.disconnect();
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your MONGODB_URI to .env");
  }

  const db = await mongoose.connect(process.env.MONGODB_URI);
  console.log("new connection");
  connection.isConnected = db.connections[0].readyState;
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === "production") {
      await mongoose.disconnect();
      connection.isConnected = false;
    } else {
      console.log("not disconnected");
    }
  }
}

export interface MongoDocument {
  _id: { toString(): string };
  createdAt?: { toString(): string };
  updatedAt?: { toString(): string };
  [key: string]: unknown;
}

function convertDocToObj<T extends MongoDocument>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

const db = { connect, disconnect, convertDocToObj };
export default db;
