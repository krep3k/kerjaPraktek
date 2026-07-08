const mongoose = require('mongoose');
const crypto = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI environment variable');
  process.exit(1);
}
if (!ENCRYPTION_KEY) {
  console.error('Please set ENCRYPTION_KEY environment variable');
  process.exit(1);
}

function decrypt(text) {
  if (!text) return text;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text;
  }
}

function hashString(text) {
  if (!text) return text;
  return crypto.createHash('sha256').update(String(text).trim()).digest('hex');
}

async function main() {
  await mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  const col = mongoose.connection.collection('students');
  const cursor = col.find({});
  let updated = 0;
  try {
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const sets = {};
      if (doc.nis && !doc.nisHash) {
        const plain = decrypt(doc.nis);
        sets.nisHash = hashString(plain);
      }
      if (doc.nisn && !doc.nisnHash) {
        const plain2 = decrypt(doc.nisn);
        sets.nisnHash = hashString(plain2);
      }
      if (Object.keys(sets).length) {
        await col.updateOne({ _id: doc._id }, { $set: sets });
        updated++;
      }
    }

    // Ensure indexes
    await col.createIndex({ nisHash: 1 }, { unique: true });
    await col.createIndex({ nisnHash: 1 }, { unique: true, sparse: true });

    // Backfill user nip/nuptk hashes and ensure indexes on users
    const usersCol = mongoose.connection.collection('users');
    const userCursor = usersCol.find({});
    let usersUpdated = 0;
    while (await userCursor.hasNext()) {
      const userDoc = await userCursor.next();
      const setsUser = {};
      if (userDoc.nip && !userDoc.nipHash) {
        const plainNip = decrypt(userDoc.nip);
        setsUser.nipHash = hashString(plainNip);
      }
      if (userDoc.nuptk && !userDoc.nuptkHash) {
        const plainNuptk = decrypt(userDoc.nuptk);
        setsUser.nuptkHash = hashString(plainNuptk);
      }
      if (Object.keys(setsUser).length) {
        await usersCol.updateOne({ _id: userDoc._id }, { $set: setsUser });
        usersUpdated++;
      }
    }
    await usersCol.createIndex({ nipHash: 1 }, { unique: true, sparse: true });
    await usersCol.createIndex({ nuptkHash: 1 }, { unique: true, sparse: true });

    console.log('Users updated:', usersUpdated);

    console.log('Done. documents updated:', updated);
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
