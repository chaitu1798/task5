document.addEventListener('DOMContentLoaded', () => {
  // Update cart count on page load
  updateCartCount();

  // Check if we are on the homepage to render products
  if (document.getElementById('product-grid')) {
    setupHomepage();
  }

  // Check if we are on the cart page to render cart items
  const cartItemsContainer = document.getElementById('cart-items');
  if (cartItemsContainer) {
    renderCartItems();
  }
  
  // Check if we are on the product page
  const productDetailContainer = document.getElementById('product-detail');
  if (productDetailContainer) {
    renderProductDetail();
  }

  // Handle coupon code application on checkout page
  const applyCouponBtn = document.getElementById('apply-coupon');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', handleApplyCoupon);
  }

  // Handle checkout form submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const paymentMethod = checkoutForm.payment.value;
          const couponCode = document.getElementById('coupon').value.trim();
          const discount = getAppliedDiscount();
          const cart = getCart();
          const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const discountedTotal = total - discount;
          // Save order details for confirmation page
          localStorage.setItem('orderDetails', JSON.stringify({
            name: checkoutForm.name.value,
            email: checkoutForm.email.value,
            address: checkoutForm.address.value,
            paymentMethod,
            couponCode,
            discount,
            total,
            discountedTotal,
            cart
          }));
          alert('Order placed successfully!');
          clearCart();
          window.location.href = 'confirmation.html';
      });
  }

  // Proceed to Checkout button logic (cart page)
  const proceedBtn = document.getElementById('proceed-checkout-btn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', function() {
      const cart = getCart();
      if (!cart || cart.length === 0) {
        alert('Your cart is empty!');
      } else {
        window.location.href = 'checkout.html';
      }
    });
  }

});

function setupHomepage() {
    renderCategoryFilters();
    renderProducts(products); // Render all products initially

    // Header search toggle logic
    const searchToggle = document.getElementById('search-toggle');
    const headerSearchBar = document.getElementById('header-search-bar');
    if (searchToggle && headerSearchBar) {
      searchToggle.addEventListener('click', () => {
        headerSearchBar.classList.toggle('active');
        if (headerSearchBar.classList.contains('active')) {
          headerSearchBar.style.display = 'inline-block';
          headerSearchBar.focus();
        } else {
          headerSearchBar.style.display = 'none';
          headerSearchBar.value = '';
          filterAndRenderProducts();
        }
      });
      headerSearchBar.addEventListener('input', () => filterAndRenderProducts());
    }
}

function renderCategoryFilters() {
    const categories = ['All', ...new Set(products.map(p => p.category))];
    const filtersContainer = document.getElementById('category-filters');
    
    filtersContainer.innerHTML = categories.map(category => 
        `<button class="filter-btn ${category === 'All' ? 'active' : ''}" onclick="filterByCategory('${category}')">${category}</button>`
    ).join('');
}

function filterByCategory(category) {
    // Update active button state
    document.querySelectorAll('#category-filters .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === category);
    });
    
    filterAndRenderProducts();
}

function filterAndRenderProducts() {
  // Use header search bar if present, else fallback
  let searchValue = '';
  const headerSearchBar = document.getElementById('header-search-bar');
  if (headerSearchBar && headerSearchBar.classList.contains('active')) {
    searchValue = headerSearchBar.value.toLowerCase();
  }
  const activeCategoryBtn = document.querySelector('#category-filters .active');
  const activeCategory = activeCategoryBtn ? activeCategoryBtn.textContent : 'All';

  let filteredProducts = products;

  // Filter by category
  if (activeCategory !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category === activeCategory);
  }

  // Filter by search term
  if (searchValue) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchValue) ||
      p.description.toLowerCase().includes(searchValue)
    );
  }

  renderProducts(filteredProducts);
}

function renderProducts(productsToRender) {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  productGrid.innerHTML = ''; // Clear existing content
  
  if (productsToRender.length === 0) {
      productGrid.innerHTML = '<p>No products found.</p>';
      return;
  }
  
  productsToRender.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    const inWishlist = isInWishlist(product.id);

    // Heart button for wishlist (corner)
    const heartBtn = document.createElement('button');
    heartBtn.className = 'wishlist-heart' + (inWishlist ? '' : ' outline');
    heartBtn.title = inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
    heartBtn.innerHTML = inWishlist ? '♥' : '♡';
    heartBtn.onclick = function() {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product.id);
      }
      renderProducts(productsToRender);
      updateWishlistCount();
    };
    productCard.appendChild(heartBtn);

    productCard.innerHTML += `
      <a href="product.html?id=${product.id}" style="text-decoration:none; color:inherit;">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">₹${product.price.toFixed(2)}</p>
      </a>
    `;
    // Add to Cart text button
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'btn';
    addToCartBtn.title = 'Add to Cart';
    addToCartBtn.textContent = 'Add to Cart';
    addToCartBtn.onclick = function() { addToCart(product.id); };
    productCard.appendChild(addToCartBtn);
    productGrid.appendChild(productCard);
  });
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalContainer = document.getElementById('cart-total');
  const cart = getCart();

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    if (cartTotalContainer) cartTotalContainer.innerHTML = '';
    return;
  }

  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    const itemSubtotal = item.price * item.quantity;
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p>Price: ₹${item.price.toFixed(2)}</p>
        <div class="cart-item-quantity">
          <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="cart-item-subtotal">
        <p>Subtotal: ₹${itemSubtotal.toFixed(2)}</p>
        <button class="icon-btn" title="Remove" onclick="removeFromCart(${item.id})">🗑️</button>
      </div>
    `;
    cartItemsContainer.appendChild(cartItem);
    total += itemSubtotal;
  });

  if (cartTotalContainer) {
    cartTotalContainer.innerHTML = `Total: ₹${total.toFixed(2)}`;
  }
}

function renderProductDetail() {
    const productDetailContainer = document.getElementById('product-detail');
    if (!productDetailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (product) {
        const inWishlist = isInWishlist(product.id);
        // Heart button for wishlist
        const heartBtn = document.createElement('button');
        heartBtn.className = 'wishlist-heart' + (inWishlist ? '' : ' outline');
        heartBtn.title = inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
        heartBtn.innerHTML = inWishlist ? '♥' : '♡';
        heartBtn.onclick = function() {
          if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
          } else {
            addToWishlist(product.id);
          }
          renderProductDetail();
          updateWishlistCount();
        };

        productDetailContainer.innerHTML = `
            <h1>${product.name}</h1>
            <img src="${product.image}" alt="${product.name}" style="max-width:100%;height:auto;border-radius:12px;margin-bottom: 20px;">
            <p>${product.description}</p>
            <h2>₹${product.price.toFixed(2)}</h2>
        `;
        productDetailContainer.appendChild(heartBtn);
        const addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'btn';
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.onclick = function() { addToCart(product.id); };
        productDetailContainer.appendChild(addToCartBtn);
    } else {
        productDetailContainer.innerHTML = '<h1>Product not found!</h1><a href="index.html" class="btn">Back to Shop</a>';
    }
}

// Coupon logic
let appliedDiscount = 0;
function handleApplyCoupon() {
  const couponInput = document.getElementById('coupon');
  const feedback = document.getElementById('coupon-feedback');
  const code = couponInput.value.trim().toUpperCase();
  appliedDiscount = 0;
  if (code === 'SAVE10') {
    // 10% off
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    appliedDiscount = Math.round(total * 0.10);
    feedback.textContent = 'Coupon applied! You saved ₹' + appliedDiscount;
    feedback.style.color = '#27ae60';
  } else if (code) {
    feedback.textContent = 'Invalid coupon code.';
    feedback.style.color = '#e67e22';
  } else {
    feedback.textContent = '';
  }
}
function getAppliedDiscount() {
  return appliedDiscount;
} 

// Get the nav container and the back button
const nav = document.querySelector('.nav');
const backBtn = document.getElementById('back-btn');

// Check if the back button exists
if (backBtn) {
  // Add a margin to the nav container to make space for the back button
  nav.style.marginLeft = '30px';
}