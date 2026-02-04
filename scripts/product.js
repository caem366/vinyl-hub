import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

async function loadProductDetails() {
  const listingId = localStorage.getItem('currentListingId');
  if (!listingId) {
    alert('No listing ID found.');
    return;
  }

  try {
    const docRef = doc(db, 'listings', listingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const listing = docSnap.data();
      const imagesContainer = document.getElementById('productImages');
      imagesContainer.innerHTML = ''; // Clear existing images

      const images = listing.albumPhotoUrls && listing.albumPhotoUrls.length > 0
        ? [listing.albumCoverUrl || 'https://via.placeholder.com/450x450?text=No+Image', ...listing.albumPhotoUrls]
        : [listing.albumCoverUrl || 'https://via.placeholder.com/450x450?text=No+Image'];

      // Create carousel items
      images.forEach((url, index) => {
        imagesContainer.innerHTML += `
          <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${url}" class="d-block w-100" alt="Vinyl Image - ${listing.albumTitle}">
          </div>
        `;
      });

      // Add carousel indicators
      const indicatorsContainer = document.querySelector('.carousel-indicators');
      if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
        images.forEach((_, index) => {
          indicatorsContainer.innerHTML += `
            <button type="button" 
              data-bs-target="#productImageCarousel" 
              data-bs-slide-to="${index}" 
              class="${index === 0 ? 'active' : ''}"
              aria-current="${index === 0 ? 'true' : 'false'}"
              aria-label="Slide ${index + 1}">
            </button>
          `;
        });
      }

      // Reinitialize carousel to ensure functionality
      const carouselElement = document.getElementById('productImageCarousel');
      const carouselInstance = bootstrap.Carousel.getInstance(carouselElement);
      if (carouselInstance) {
        carouselInstance.dispose(); // Dispose of the existing instance
      }
      new bootstrap.Carousel(carouselElement);

      document.getElementById('productTitle').textContent = listing.albumTitle;
      document.getElementById('productArtist').textContent = listing.artist;
      document.getElementById('productPrice').textContent = `$${listing.price}`;
      document.getElementById('productCondition').textContent = listing.condition;
      document.getElementById('productGenre').textContent = listing.genre;
      document.getElementById('productDescription').textContent = listing.description;
    } else {
      alert('Listing not found.');
      window.location.href = 'catalog.html';
    }
  } catch (error) {
    console.error('Error fetching listing:', error);
    alert('Failed to load the listing. Please try again later.');
    window.location.href = 'catalog.html';
  }
}

export function addToWishlist() {
  const user = JSON.parse(localStorage.getItem('user')); // Check if user is logged in
  if (!user) {
    alert('You must be logged in to add items to your wishlist.');
    return;
  }

  const listingId = localStorage.getItem('currentListingId');
  if (!listingId) {
    alert('No listing ID found.');
    return;
  }

  const albumTitle = document.getElementById('productTitle').textContent;
  const artist = document.getElementById('productArtist').textContent;
  const albumCoverUrl = document.querySelector('#productImages .carousel-item.active img').src;

  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  if (wishlist.some(item => item.id === listingId)) {
    alert('This item is already in your wishlist.');
    return;
  }

  wishlist.push({ id: listingId, albumTitle, artist, albumCoverUrl });
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  alert('Item added to your wishlist!');
}

document.addEventListener('DOMContentLoaded', loadProductDetails);