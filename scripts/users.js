import app from '../config/firebase-config.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const db = getFirestore(app);

async function fetchUsers() {
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);

    querySnapshot.forEach((doc) => {
      const user = doc.data();
      console.log(`User ID: ${doc.id}, Username: ${user.username}, Email: ${user.email}`);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchUsers);
