const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

async function listAllUsers(nextPageToken) {
  try {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    result.users.forEach((userRecord) => {
      console.log(`User ID: ${userRecord.uid}, Email: ${userRecord.email}`);
    });

    if (result.pageToken) {
      // List next batch of users
      await listAllUsers(result.pageToken);
    }
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listAllUsers();
