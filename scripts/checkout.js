async function fetchCartItems() {
  try {
    const response = await fetch('/api/checkout');
    if (response.ok) {
      const cartItems = await response.json();
      console.log('Cart items:', cartItems);
      // Render cart items on the page
    } else {
      console.error('Failed to fetch cart items.');
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const orderSummary = document.getElementById('orderSummary');
  const selectedListing = JSON.parse(localStorage.getItem('selectedListing'));

  if (selectedListing) {
    orderSummary.innerHTML = `
      <li class="list-group-item d-flex justify-content-between">
        <span>${selectedListing.title} by ${selectedListing.artist}</span>
        <strong>$${selectedListing.price.toFixed(2)}</strong>
      </li>
    `;
  } else {
    orderSummary.innerHTML = '<p class="text-muted">No items in the order summary.</p>';
  }
});
