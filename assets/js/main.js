function getImagePath(image) {
  return image.startsWith("http") ? image : `../${image}`;
}

function displayFeaturedProducts(limit = 5) {
  const productGrid = document.getElementById("featuredProducts");
  if (!productGrid) return;

  const currentPage = window.location.pathname;
  const isIndexPage =
    currentPage.endsWith("index.html") ||
    currentPage === "/" ||
    currentPage === "";
  const detailPagePath = isIndexPage
    ? "pages/product-detail.html"
    : "product-detail.html";

  const displayProducts = limit ? products.slice(0, limit) : products;
  productGrid.innerHTML = displayProducts
    .map(
      (product) => `
        <div class="product-card">
            <img src="${getImagePath(product.image)}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.price.toLocaleString("vi-VN")} VNĐ</p>
            <button class="add-to-cart" onclick="addToCart(${
              product.id
            })">Thêm vào giỏ</button>
            <a href="${detailPagePath}?id=${product.id}">Xem chi tiết</a>
        </div>
    `
    )
    .join("");
}

function displayFeaturedBlogs() {
  const blogGrid = document.getElementById("featuredBlogs");
  if (!blogGrid) return;
  blogGrid.innerHTML = blogs
    .slice(0, 3)
    .map(
      (blog) => `
        <div class="blog-card">
            <img src="${blog.image}" alt="${blog.title}">
            <h3>${blog.title}</h3>
            <a href="pages/blog-detail.html?id=${blog.id}">Đọc thêm</a>
        </div>
    `
    )
    .join("");
}

function displayCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartItems || !cartTotal) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    cartTotal.textContent = "0 VNĐ";
    return;
  }

  let total = 0;
  cartItems.innerHTML = cart
    .map((item, index) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return "";
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      return `
            <div class="cart-item">
                <img src="${getImagePath(item.image)}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>Giá: ${product.price.toLocaleString("vi-VN")} VNĐ</p>
                    <p>Số lượng: <input type="number" value="${
                      item.quantity
                    }" min="1" onchange="updateCartItem(${index}, this.value)"></p>
                    <p>Tổng: ${itemTotal.toLocaleString("vi-VN")} VNĐ</p>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">Xóa</button>
            </div>
        `;
    })
    .join("");

  cartTotal.textContent = `${total.toLocaleString("vi-VN")} VNĐ`;
}

function updateCartItem(index, quantity) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  quantity = parseInt(quantity);
  if (quantity < 1) quantity = 1;
  cart[index].quantity = quantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
  showNotification("Cập nhật số lượng thành công!");
}

function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const removedItem = cart.splice(index, 1)[0];
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
  showNotification(`${removedItem.name} đã được xóa khỏi giỏ hàng!`);
}

function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    showNotification("Giỏ hàng trống, vui lòng thêm sản phẩm!", true);
    return;
  }
  showNotification("Thanh toán thành công! Giỏ hàng đã được xóa.");
  localStorage.removeItem("cart");
  displayCart();
  updateCartCount();
}

function changeSlide(direction) {
  const slides = document.querySelectorAll(".banner-slides img");
  if (slides.length === 0) return;
  let currentSlide = Array.from(slides).findIndex((slide) =>
    slide.classList.contains("active")
  );
  slides[currentSlide].classList.remove("active");
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElements = document.querySelectorAll("#cartCount");
  cartCountElements.forEach((element) => {
    element.textContent = cartCount;
  });
}

function addToCart(productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification(`${product.name} đã được thêm vào giỏ hàng!`);
}

function showNotification(message, isError = false) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = "notification";
  if (isError) {
    notification.classList.add("error");
  }
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

function searchProducts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const searchResults = document.getElementById("searchResults");
  if (query.length < 2) {
    searchResults.style.display = "none";
    return;
  }

  const currentPage = window.location.pathname;
  const isIndexPage =
    currentPage.endsWith("index.html") ||
    currentPage === "/" ||
    currentPage === "";
  const detailPagePath = isIndexPage
    ? "pages/product-detail.html"
    : "product-detail.html";

  const results = products.filter((product) =>
    product.name.toLowerCase().includes(query)
  );
  if (results.length === 0) {
    searchResults.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
  } else {
    searchResults.innerHTML = results
      .map(
        (product) => `
            <div class="search-result-item" onclick="window.location.href='${detailPagePath}?id=${
          product.id
        }'">
                <img src="${getImagePath(product.image)}" alt="${product.name}">
                <p>${product.name} - ${product.price.toLocaleString(
          "vi-VN"
        )} VNĐ</p>
            </div>
        `
      )
      .join("");
  }
  searchResults.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  displayFeaturedProducts();
  displayFeaturedBlogs();
  displayCart();
  updateCartCount();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchProducts);
  }

  let lastScrollTop = 0;
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    const backToTop = document.querySelector(".back-to-top");
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
      header.classList.add("hidden");
    } else {
      header.classList.remove("hidden");
    }

    if (currentScroll > 300) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  const bannerSlides = document.querySelector(".banner-slides");
  if (bannerSlides) {
    setInterval(() => changeSlide(1), 5000);
  }
});
