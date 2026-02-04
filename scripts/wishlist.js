const wishlistKey = 'wishlist';

function loadWishlist() {
  const wishlistContainer = document.getElementById('wishlistContainer');
  if (!wishlistContainer) {
    console.error('wishlistContainer element not found.');
    return;
  }

  const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
  wishlistContainer.innerHTML = '';

  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = '<p class="text-muted text-center">Your wishlist is empty.</p>';
    return;
  }

  wishlist.forEach(item => {
    wishlistContainer.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="${item.albumCoverUrl || 'https://via.placeholder.com/300x300?text=No+Image'}" class="card-img-top" alt="${item.albumTitle}">
          <div class="card-body">
            <h5 class="card-title">${item.albumTitle}</h5>
            <p class="card-text">Artist: ${item.artist}</p>
            <a href="product.html?id=${item.id}" class="btn btn-primary">View Listing</a>
            <button class="btn btn-danger" onclick="removeFromWishlist('${item.id}')">Remove</button>
          </div>
        </div>
      </div>
    `;
  });
}

export function addToWishlist(id, albumTitle, artist, albumCoverUrl) {
  const user = JSON.parse(localStorage.getItem('user')); // Check if user is logged in
  if (!user) {
    alert('You must be logged in to add items to your wishlist.');
    return;
  }

  const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
  if (wishlist.some(item => item.id === id)) {
    alert('This item is already in your wishlist.');
    return;
  }

  wishlist.push({ id, albumTitle, artist, albumCoverUrl });
  localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  alert('Item added to your wishlist!');
}

function removeFromWishlist(id) {
  const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
  const updatedWishlist = wishlist.filter(item => item.id !== id);
  localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
  alert('Item removed from your wishlist!');
  loadWishlist(); // Refresh the wishlist display
}

window.removeFromWishlist = removeFromWishlist; // Expose the function globally

document.addEventListener('DOMContentLoaded', loadWishlist);
