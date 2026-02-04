import app from '../config/firebase-config.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';
import { handleLogout } from './auth.js';

const auth = getAuth(app);

export function loadNavbar(callback) {
  const navbarContainer = document.querySelector('nav');
  if (navbarContainer) {
    console.log('Navbar loaded');
    if (callback) callback();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const accountDropdown = document.getElementById('accountDropdown');
  const sellVinylLink = document.getElementById('sellVinylLink');
  const logoutButton = document.getElementById('logoutButton');
  const navbarNav = document.querySelector('.navbar-nav.ms-auto');

  // Monitor authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User is logged in:', user);
      if (accountDropdown) accountDropdown.style.display = 'block';
      if (sellVinylLink) sellVinylLink.style.display = 'block';

      // Ensure "Wishlist" link is visible
      const wishlistLink = document.getElementById('wishlistLink');
      if (wishlistLink) wishlistLink.style.display = 'block';

      // Remove the "Login/Register" link if it exists
      const loginLink = document.getElementById('loginLink');
      if (loginLink) loginLink.remove();
    } else {
      console.log('User is not logged in.');
      if (accountDropdown) accountDropdown.style.display = 'none';
      if (sellVinylLink) sellVinylLink.style.display = 'none';

      // Ensure the "Login/Register" link is visible
      if (!document.getElementById('loginLink')) {
        const loginNavItem = document.createElement('li');
        loginNavItem.className = 'nav-item';
        loginNavItem.id = 'loginLink';
        loginNavItem.innerHTML = `<a class="nav-link" href="auth.html">Login</a>`;
        navbarNav.appendChild(loginNavItem);
      }

      // Hide "Wishlist" link if it exists
      const wishlistLink = document.getElementById('wishlistLink');
      if (wishlistLink) wishlistLink.style.display = 'none';
    }
  });

  // Add logout functionality
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});