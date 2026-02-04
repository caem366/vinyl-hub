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

async function syncUsers() {
  try {
    const auth = admin.auth();
    const usersCollection = db.collection('users');

    let nextPageToken;
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      for (const userRecord of listUsersResult.users) {
        const { uid, email } = userRecord;

        // Check if the user already exists in Firestore
        const userDoc = await usersCollection.doc(uid).get();
        if (!userDoc.exists) {
          // Generate a username from the email (e.g., "user@example.com" -> "user")
          const username = email.split('@')[0];
          console.log(`Assigning username "${username}" to user ${uid}`);

          // Add the user to Firestore
          await usersCollection.doc(uid).set({
            username,
            email,
            role: 'user',
            profilePicture: '',
            createdAt: new Date().toISOString(),
          });
          console.log(`User ${uid} added to Firestore.`);
        } else {
          console.log(`User ${uid} already exists in Firestore.`);
        }
      }
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log('User synchronization completed.');
  } catch (error) {
    console.error('Error synchronizing users:', error);
  }
}

syncUsers();
