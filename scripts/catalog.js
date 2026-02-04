import app from '../config/firebase-config.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';

const db = getFirestore(app);

async function loadListings() {
  const listingsContainer = document.getElementById('listingsContainer');
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const genreFilter = document.getElementById('genreFilter').value;
  const conditionFilter = document.getElementById('conditionFilter').value; // New filter
  const priceFilter = document.getElementById('priceFilter').value;

  listingsContainer.innerHTML = ''; // Clear existing content

  try {
    const querySnapshot = await getDocs(collection(db, 'listings'));
    let listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply search filter
    if (searchInput) {
      listings = listings.filter(listing =>
        listing.albumTitle.toLowerCase().includes(searchInput) ||
        listing.artist.toLowerCase().includes(searchInput)
      );
    }

    // Apply genre filter
    if (genreFilter) {
      listings = listings.filter(listing => 
        listing.genre === genreFilter || listing.genre.includes(genreFilter)
      );
    }

    // Apply condition filter
    if (conditionFilter) {
      listings = listings.filter(listing => listing.condition === conditionFilter);
    }

    // Apply price sorting
    if (priceFilter === 'low-to-high') {
      listings.sort((a, b) => a.price - b.price);
    } else if (priceFilter === 'high-to-low') {
      listings.sort((a, b) => b.price - a.price);
    }

    renderListings(listings);

    if (listings.length === 0) {
      listingsContainer.innerHTML = '<p class="text-muted">No listings available.</p>';
    }
  } catch (error) {
    console.error('Error loading listings:', error);
    listingsContainer.innerHTML = '<p class="text-danger">Failed to load listings. Please try again later.</p>';
  }
}

function renderListings(listings) {
  const listingsContainer = document.getElementById('listingsContainer');
  listingsContainer.innerHTML = listings.map(listing => `
    <div class="col-md-3 mb-4"> 
      <div class="card catalog-card">
        <img src="${listing.albumCoverUrl || 'https://via.placeholder.com/300x300?text=No+Image'}" class="card-img-top" alt="${listing.albumTitle}">
        <div class="card-body">
          <h5 class="card-title">${listing.albumTitle}</h5>
          <p class="card-text">
            Artist: 
            <a href="catalog.html?artist=${encodeURIComponent(listing.artist)}" class="text-decoration-none" style="color: gray;">
              ${listing.artist}
            </a>
          </p>
          <p class="card-text">
            Genre: 
            <a href="catalog.html?genre=${encodeURIComponent(listing.genre)}" class="text-decoration-none" style="color: gray;">
              ${listing.genre}
            </a>
          </p>
          <p class="card-text">Price: $${listing.price}</p>
          <p class="card-text">Condition: ${listing.condition}</p>
          <div class="d-flex justify-content-between gap-1">
            <button class="btn btn-primary" onclick="buyNow('${listing.albumTitle}', '${listing.artist}', ${listing.price})">Buy Now</button>
            <button class="btn btn-secondary" onclick="addToWishlist('${listing.id}', '${listing.albumTitle}', '${listing.artist}', '${listing.albumCoverUrl}')">Add to Wishlist</button>
            <button class="btn btn-black" onclick="viewDetails('${listing.id}')">View Details</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function buyNow(title, artist, price) {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, artist, price }),
    });

    if (response.ok) {
      console.log('Item successfully added to checkout');
      window.location.href = 'checkout.html';
    } else {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || 'An unexpected error occurred on the server.';
      console.error('Server error:', errorMessage);
      alert('Failed to add item to checkout: ' + errorMessage);
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('A network error occurred. Please check your connection and try again.');
  }
}

function addToWishlist(id, albumTitle, artist, albumCoverUrl) {
  const user = JSON.parse(localStorage.getItem('user')); // Check if user is logged in
  if (!user) {
    alert('You must be logged in to add items to your wishlist.');
    return;
  }

  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  if (wishlist.some(item => item.id === id)) {
    alert('This item is already in your wishlist.');
    return;
  }

  wishlist.push({ id, albumTitle, artist, albumCoverUrl });
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  alert('Item added to your wishlist!');
}

function viewDetails(listingId) {
  localStorage.setItem('currentListingId', listingId); // Save listingId to localStorage
  window.location.href = `product.html?id=${listingId}`;
}

// Attach event listeners for search and filter inputs
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const artistFilter = urlParams.get('artist'); //get artist from URL
  const genreFilter = urlParams.get('genre'); // Get genre from URL

  if (artistFilter) {
    document.getElementById('searchInput').value = artistFilter;
  }

  if (genreFilter) {
    document.getElementById('genreFilter').value = genreFilter; // Set genre filter
  }

  loadListings();
  document.getElementById('searchInput').addEventListener('input', loadListings);
  document.getElementById('genreFilter').addEventListener('change', loadListings);
  document.getElementById('priceFilter').addEventListener('change', loadListings);
  document.getElementById('conditionFilter').addEventListener('change', loadListings); // Add event listener
});