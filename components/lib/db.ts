/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

declare global {
    var mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Mongoose> | null;
    } | undefined;
}

const cached =(global as any).mongoose || { conn: null, promise: null };
export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    (global as any).mongoose = cached;
    return cached.conn;
}