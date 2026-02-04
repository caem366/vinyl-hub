import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve('config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  projectId: 'vinyl-hub',
});

const db = getFirestore();

async function listUsernames() {
  try {
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.get();

    if (snapshot.empty) {
      console.log('No users found.');
      return;
    }

    snapshot.forEach((doc) => {
      const user = doc.data();
      console.log(`User ID: ${doc.id}, Username: ${user.username}, Email: ${user.email}`);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

listUsernames();
