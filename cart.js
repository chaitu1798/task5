// Cart functionality using localStorage
function addToCart(productId) {
  let cart = getCart();
  const product = products.find(p => p.id === productId);

  if (!product) return;

  const cartItem = cart.find(item => item.id === productId);

  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  alert(`${product.name} has been added to your cart.`);
}

function getCart() {
  return JSON.parse(localStorage.getItem('shoppingCart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  updateCartCount();
  // This function might need to re-render the cart page
  if (document.getElementById('cart-items')) {
    renderCartItems();
  }
}

function updateItemQuantity(productId, quantity) {
  let cart = getCart();
  const item = cart.find(p => p.id === productId);

  if (item) {
    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      // If quantity is 0 or less, remove the item
      cart = cart.filter(p => p.id !== productId);
    }
  }
  
  saveCart(cart);
  updateCartCount();

  // Re-render cart page if we are on it
  if (document.getElementById('cart-items')) {
    renderCartItems();
  }
}

function updateCartCount() {
  const cart = getCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
    cartCountElement.style.display = cartCount > 0 ? 'inline-block' : 'none';
  }
}

function clearCart() {
    localStorage.removeItem('shoppingCart');
    updateCartCount();
} 