import app from '../config/firebase-config.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const auth = getAuth(app);
const db = getFirestore(app);

// Function to handle login
export async function handleLogin(emailOrUsername, password) {
  try {
    let email = emailOrUsername;

    // If the input is a username, fetch the associated email from Firestore
    if (!email.includes('@')) {
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(query(usersCollection, where('username', '==', emailOrUsername)));
      if (querySnapshot.empty) {
        throw new Error('Username not found.');
      }
      email = querySnapshot.docs[0].data().email;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert('Login successful!');
    localStorage.setItem('firebaseToken', await userCredential.user.getIdToken());
    window.location.href = 'index.html'; // Redirect to the home page
  } catch (error) {
    console.error('Login failed:', error);
    alert(`Login failed: ${error.message}`);
  }
}

// Function to handle registration
export async function handleRegister(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Write user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      username,
      email,
      role: 'user',
      profilePicture: '',
      createdAt: new Date().toISOString(),
    });

    alert('Registration successful! You can now log in.');
    window.location.href = 'auth.html'; // Redirect to the login page
  } catch (error) {
    console.error('Registration failed:', error);
    alert(`Registration failed: ${error.message}`);
  }
}

// Attach event listener to registration form
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('emailRegister').value;
      const password = document.getElementById('passwordRegister').value;
      const username = document.getElementById('usernameRegister').value;

      await handleRegister(email, password, username);
    });
  }
});

// Function to handle logout
export function handleLogout() {
  signOut(auth)
    .then(() => {
      alert('Logged out successfully!');
      window.location.href = 'index.html'; // Redirect to the home page
    })
    .catch((error) => {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    });
}

// Function to update navigation based on login state
export function updateNavigation() {
  onAuthStateChanged(auth, (user) => {
    const accountDropdown = document.getElementById('accountDropdown');
    const loginLink = document.getElementById('loginLink');
    const loginRegisterDropdownItem = document.querySelector('.dropdown-item[href="auth.html"]');

    if (user) {
      console.log('User is logged in:', user);
      if (accountDropdown) accountDropdown.style.display = 'block';
      if (loginLink) loginLink.remove();
      if (loginRegisterDropdownItem) loginRegisterDropdownItem.remove(); // Remove "Login" link
    } else {
      console.log('User is not logged in.');
      if (accountDropdown) accountDropdown.style.display = 'none'; // Ensure dropdown is hidden

      // Ensure the "Login/Register" link is visible
      if (!document.getElementById('loginLink')) {
        const navbarNav = document.querySelector('.navbar-nav.ms-auto');
        const loginNavItem = document.createElement('li');
        loginNavItem.className = 'nav-item';
        loginNavItem.id = 'loginLink';
        loginNavItem.innerHTML = `<a class="nav-link" href="auth.html">Login</a>`;
        navbarNav.appendChild(loginNavItem);
      }
    }
  });
}

// Redirect unauthenticated users
export function requireAuth() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert('You must be logged in to access this page.');
      window.location.href = 'auth.html'; // Redirect to login/register page
    }
  });
}