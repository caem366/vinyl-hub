import app from '../config/firebase-config.js';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';

const db = getFirestore(app);
const auth = getAuth(app);

// Load product details from URL or localStorage
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    let listingId = urlParams.get('id');
    
    // Check if listingId is in localStorage if not in URL
    if (!listingId) {
        listingId = localStorage.getItem('currentListingId');
        if (!listingId) {
            alert('No listing ID provided.');
            window.location.href = 'catalog.html';
            return;
        }
    } else {
        // Save listingId to localStorage for future reloads
        localStorage.setItem('currentListingId', listingId);
    }
    
    try {
        const docRef = doc(db, 'listings', listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const listing = docSnap.data();
            const imagesContainer = document.getElementById('productImages');
            imagesContainer.innerHTML = ''; // Clear existing images

            // Combine albumCoverUrl and albumPhotoUrls into a single array
            const images = [
                listing.albumCoverUrl || 'https://via.placeholder.com/300x300?text=No+Image',
                ...(listing.albumPhotoUrls || [])
            ];

            images.forEach((url, index) => {
                imagesContainer.innerHTML += `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <img src="${url}" class="d-block w-100" alt="Vinyl Image">
                    </div>
                `;
            });

            // Reinitialize carousel
            const carouselElement = document.getElementById('productImageCarousel');
            const carouselInstance = bootstrap.Carousel.getInstance(carouselElement);
            if (carouselInstance) {
                carouselInstance.dispose(); // Dispose of the existing instance
            }
            new bootstrap.Carousel(carouselElement);

            document.getElementById('productTitle').textContent = listing.albumTitle;
            document.getElementById('productArtist').textContent = listing.artist;
            document.getElementById('productGenre').textContent = listing.genre;

            // Dynamically set the href attributes for artist and genre links
            document.getElementById('artistLink').href = `catalog.html?artist=${encodeURIComponent(listing.artist)}`;
            document.getElementById('genreLink').href = `catalog.html?genre=${encodeURIComponent(listing.genre)}`;

            document.getElementById('productPrice').textContent = `$${listing.price}`;
            document.getElementById('productCondition').textContent = listing.condition;
            document.getElementById('productDescription').textContent = listing.description;

            // Load reviews after product details are displayed
            await loadReviews(listingId);
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

// Load existing reviews for a specific product
async function loadReviews(productId) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = ''; // Clear existing reviews

    try {
        const reviewsSnapshot = await getDocs(collection(db, `listings/${productId}/reviews`));
        if (reviewsSnapshot.empty) {
            reviewsContainer.innerHTML = '<p class="text-muted">No reviews yet. Be the first to leave one!</p>';
            return;
        }

        reviewsSnapshot.forEach((docSnapshot) => {
            const review = docSnapshot.data();
            const reviewElement = document.createElement('div');
            reviewElement.className = 'card p-3 shadow-sm mb-3';
            reviewElement.id = `review-${docSnapshot.id}`;
            
            // Check if the current user is the author of this review
            const currentUser = auth.currentUser;
            const isAuthor = currentUser && review.userId === currentUser.uid;
            
            console.log('Review userId:', review.userId);
            console.log('Current user:', currentUser ? currentUser.uid : 'Not logged in');
            console.log('Is author:', isAuthor);
            
            reviewElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="review-content">
                        <strong>${review.reviewerName}</strong> 
                        <span class="text-muted">${new Date(review.timestamp).toLocaleString()}</span>
                        <div>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                        <p>${review.content}</p>
                    </div>
                    <div class="review-actions">
                        ${isAuthor ? 
                            `<button class="btn btn-black btn-sm me-2 edit-review" data-review-id="${docSnapshot.id}">Edit</button>
                             <button class="btn btn-danger btn-sm delete-review" data-review-id="${docSnapshot.id}">Delete</button>` 
                            : ''}
                    </div>
                </div>
            `;
            reviewsContainer.appendChild(reviewElement);
            
            // Add event listener to delete button if present
            if (isAuthor) {
                const deleteButton = reviewElement.querySelector('.delete-review');
                deleteButton.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this review?')) {
                        const reviewId = deleteButton.getAttribute('data-review-id');
                        await deleteReview(productId, reviewId);
                        await loadReviews(productId); // Reload reviews after deletion
                    }
                });
                
                // Add event listener to edit button
                const editButton = reviewElement.querySelector('.edit-review');
                editButton.addEventListener('click', () => {
                    const reviewId = editButton.getAttribute('data-review-id');
                    editReview(productId, reviewId, review);
                });
            }
        });
    } catch (error) {
        console.error('Error loading reviews:', error.message);
        reviewsContainer.innerHTML = '<p class="text-danger">Failed to load reviews. Please try again later.</p>';
    }
}

// Delete a review
async function deleteReview(listingId, reviewId) {
    try {
        // Verify the current user is authorized to delete this review
        const reviewRef = doc(db, `listings/${listingId}/reviews`, reviewId);
        const reviewSnap = await getDoc(reviewRef);
        
        if (!reviewSnap.exists()) {
            throw new Error('Review not found');
        }
        
        const reviewData = reviewSnap.data();
        const currentUser = auth.currentUser;
        
        if (!currentUser || reviewData.userId !== currentUser.uid) {
            throw new Error('Unauthorized to delete this review');
        }
        
        // Delete the review
        await deleteDoc(reviewRef);
        alert('Review deleted successfully');
    } catch (error) {
        console.error('Error deleting review:', error);
        alert(`Failed to delete review: ${error.message}`);
    }
}

// Edit a review
function editReview(listingId, reviewId, reviewData) {
    const reviewElement = document.getElementById(`review-${reviewId}`);
    if (!reviewElement) return;
    
    // Replace review content with an edit form
    const reviewContent = reviewElement.querySelector('.review-content');
    const originalHTML = reviewContent.innerHTML;
    
    // Add editing class to the parent for styling
    reviewElement.classList.add('editing');
    
    // Style the parent to take full width
    reviewElement.style.width = '100%';
    
    reviewContent.innerHTML = `
        <form id="edit-review-form-${reviewId}" class="edit-review-form">
            <div class="row">
                <div class="col-12">
                    <div class="mb-3">
                        <label for="edit-reviewer-name-${reviewId}" class="form-label">Your Name:</label>
                        <input type="text" class="form-control" id="edit-reviewer-name-${reviewId}" 
                            value="${reviewData.reviewerName}" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="edit-rating-${reviewId}" class="form-label">Rating:</label>
                        <div class="rating-slider">
                            <input type="range" id="edit-rating-${reviewId}" min="1" max="5" step="1" 
                                value="${reviewData.rating}" oninput="updateEditStarRating('${reviewId}', this.value)">
                            <div id="edit-star-display-${reviewId}" class="stars">
                                ${'★'.repeat(reviewData.rating)}${'☆'.repeat(5 - reviewData.rating)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="mb-3">
                        <label for="edit-content-${reviewId}" class="form-label">Review:</label>
                        <textarea class="form-control" id="edit-content-${reviewId}" rows="4" required>${reviewData.content}</textarea>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end mt-3">
                <button type="button" class="btn btn-secondary btn-sm me-2" id="cancel-edit-${reviewId}">Cancel</button>
                <button type="submit" class="btn btn-black btn-sm">Save Changes</button>
            </div>
        </form>
    `;
    
    // Save original HTML for cancellation
    reviewElement.dataset.originalHtml = originalHTML;
    
    // Hide the action buttons while editing
    const reviewActions = reviewElement.querySelector('.review-actions');
    reviewActions.style.display = 'none';
    
    // Add event listener for cancel button
    document.getElementById(`cancel-edit-${reviewId}`).addEventListener('click', () => {
        reviewContent.innerHTML = originalHTML;
        reviewActions.style.display = 'block';
        reviewElement.classList.remove('editing');
        reviewElement.style.width = ''; // Reset the inline width style
    });
    
    // Add event listener for the edit form submission
    document.getElementById(`edit-review-form-${reviewId}`).addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const updatedReviewerName = document.getElementById(`edit-reviewer-name-${reviewId}`).value.trim();
        const updatedContent = document.getElementById(`edit-content-${reviewId}`).value.trim();
        const updatedRating = parseInt(document.getElementById(`edit-rating-${reviewId}`).value, 10);
        
        if (!updatedReviewerName || !updatedContent) {
            alert('Please fill out all fields.');
            return;
        }
        
        await updateReview(listingId, reviewId, {
            reviewerName: updatedReviewerName,
            content: updatedContent,
            rating: updatedRating,
            // Keep the original timestamp and userId
            timestamp: reviewData.timestamp,
            userId: reviewData.userId
        });
        
        // Reload reviews to show the updated review
        await loadReviews(listingId);
    });
}

// Helper function to update star rating during edit
window.updateEditStarRating = function(reviewId, value) {
    const starDisplay = document.getElementById(`edit-star-display-${reviewId}`);
    starDisplay.textContent = '★'.repeat(value) + '☆'.repeat(5 - value);
};

// Update a review in Firestore
async function updateReview(listingId, reviewId, reviewData) {
    try {
        // Verify the current user is authorized to edit this review
        const currentUser = auth.currentUser;
        
        if (!currentUser || reviewData.userId !== currentUser.uid) {
            throw new Error('Unauthorized to edit this review');
        }
        
        // Update the review in Firestore
        const reviewRef = doc(db, `listings/${listingId}/reviews`, reviewId);
        await updateDoc(reviewRef, reviewData);
        
        alert('Review updated successfully');
    } catch (error) {
        console.error('Error updating review:', error);
        alert(`Failed to update review: ${error.message}`);
    }
}

// Function to add to wishlist
function addToWishlist() {
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

// Submit a new review for a specific product
async function submitReview(event, listingId) {
    event.preventDefault();

    const reviewerName = document.getElementById('reviewerName').value.trim();
    const reviewContent = document.getElementById('reviewContent').value.trim();
    const reviewRating = document.getElementById('ratingSlider').value;

    if (!reviewerName || !reviewContent || !reviewRating) {
        alert('Please fill out all fields before submitting your review.');
        return;
    }

    try {
        // Check if user is logged in
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('You must be logged in to post a review');
            return;
        }

        // Add review to Firestore with user ID
        await addDoc(collection(db, `listings/${listingId}/reviews`), {
            reviewerName,
            content: reviewContent,
            rating: parseInt(reviewRating, 10),
            timestamp: Date.now(),
            userId: currentUser.uid // Store the user ID with the review
        });

        alert('Review submitted successfully!');
        document.getElementById('reviewForm').reset();
        document.getElementById('starDisplay').textContent = '★★★☆☆'; // Reset star rating
        await loadReviews(listingId); // Reload reviews
    } catch (error) {
        console.error('Error submitting review:', error.message);
        alert('Failed to submit review. Please try again.');
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("products.js initialized");
    
    // First load product details
    loadProductDetails();
    
    // Handle review form submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id') || localStorage.getItem('currentListingId');
            if (!productId) {
                alert('No product ID found.');
                return;
            }
            submitReview(event, productId);
        });
    }
    
    // Prefill reviewer name from authenticated user if available
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User authenticated:', user.uid);
            const reviewNameInput = document.getElementById('reviewerName');
            if (reviewNameInput && !reviewNameInput.value) {
                // Attempt to get displayName, fallback to email
                const userName = user.displayName || user.email.split('@')[0];
                reviewNameInput.value = userName;
            }
            
            // Reload reviews when authentication state changes to update delete buttons
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id') || localStorage.getItem('currentListingId');
            if (productId) {
                loadReviews(productId);
            }
        }
    });
    
    // Expose functions to global scope
    window.addToWishlist = addToWishlist;
    window.loadReviews = loadReviews;
    window.deleteReview = deleteReview;
    window.editReview = editReview;
    window.updateReview = updateReview;
});
