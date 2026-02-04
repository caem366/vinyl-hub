const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = path.resolve('config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://vinyl-hub-default-rtdb.firebaseio.com',
});

const db = admin.firestore();

async function updateUsers() {
  try {
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.get();

    if (snapshot.empty) {
      console.log('No users found in the database.');
      return;
    }

    snapshot.forEach(async (doc) => {
      const userData = doc.data();

      // Check if the username field already exists
      if (!userData.username) {
        const email = userData.email;
        const username = email.split('@')[0]; // Generate a username from the email (e.g., "user@example.com" -> "user")

        // Update the document with the new username field
        await usersCollection.doc(doc.id).update({ username });
        console.log(`Updated user ${doc.id} with username: ${username}`);
      } else {
        console.log(`User ${doc.id} already has a username.`);
      }
    });

    console.log('Firestore update completed.');
  } catch (error) {
    console.error('Error updating Firestore:', error);
  }
}

updateUsers();