// Wishlist functionality using localStorage
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function saveWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function addToWishlist(productId) {
  let wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    saveWishlist(wishlist);
    updateWishlistCount();
    alert('Added to wishlist!');
  }
}

function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(id => id !== productId);
  saveWishlist(wishlist);
  updateWishlistCount();
  renderWishlistItems && renderWishlistItems();
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

function updateWishlistCount() {
  const wishlist = getWishlist();
  const wishlistCountElement = document.getElementById('wishlist-count');
  if (wishlistCountElement) {
    wishlistCountElement.textContent = wishlist.length;
    wishlistCountElement.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
  }
} 