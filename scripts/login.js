import { handleLogin } from './auth.js';
import app from '../config/firebase-config.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const db = getFirestore(app);

// Toggle between email and username login
document.getElementById('loginType').addEventListener('change', (e) => {
  const loginType = e.target.value;
  if (loginType === 'email') {
    document.getElementById('emailLoginGroup').classList.remove('d-none');
    document.getElementById('usernameLoginGroup').classList.add('d-none');
  } else {
    document.getElementById('emailLoginGroup').classList.add('d-none');
    document.getElementById('usernameLoginGroup').classList.remove('d-none');
  }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const loginType = document.getElementById('loginType').value;
  const password = document.getElementById('passwordLogin').value;

  let emailOrUsername = '';
  if (loginType === 'email') {
    emailOrUsername = document.getElementById('emailLogin').value;
  } else {
    emailOrUsername = document.getElementById('usernameLogin').value;
  }

  await handleLogin(emailOrUsername, password);
});