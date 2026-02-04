import app from '../config/firebase-config.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const db = getFirestore(app);

async function createUser(username, email) {
  try {
    await addDoc(collection(db, 'users'), {
      username,
      email,
      role: 'user',
      profilePicture: '',
      createdAt: new Date().toISOString(),
    });
    console.log('User created successfully!');
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Example usage
createUser('testuser', 'testuser@example.com');
