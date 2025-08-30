const waNumber = +919447393193; // change to your WhatsApp number

let selectedProduct = null;
let selectedSize = null;

let sizes = [];

function openSizeModal(product) {
  selectedProduct = product;
  selectedSize = null;
  const modalSizes = $("#modalSizes");
  modalSizes.empty();

  if (!product.sizes || product.sizes.length === 0) {
    alert("error!!! no sizes available for this product");
    return;
  }

  product.sizes.forEach(size => {
    const btn = $("<button>")
      .addClass("btn btn-outline-dark btn-sm rounded-pill")
      .text(size)
      .on("click", function () {
        selectedSize = size;
        modalSizes.find(".btn").removeClass("active");
        $(this).addClass("active");
      });

    modalSizes.append(btn);
  });

  const modal = new bootstrap.Modal($("#sizeModal")[0]);
  modal.show();

  $("#modalAddBtn").off("click").on("click", function () {
    if (!selectedSize) {
      alert("Please select a size!");
      return;
    }
    addToCart(product.id, selectedSize, 1);
    updateCartBadge();
    modal.hide();
  });
}

$("#chatLink").attr('href', `https://wa.me/${waNumber}?text=Hi`)
function setProductCategories() {
  const select = $("#categoryFilter");
  if (!select.length) return;

  select.empty(); // clear old

  productCategories.forEach(c => {
    $("<option>").val(c).text(c).appendTo(select);
  });
}

// Build product cards on index
function buildCards() {
  const grid = $("#productGrid");
  if (!grid.length || !products) return;

  const q = ($("#searchInput").val() || "").toLowerCase();
  const filterCat = $("#categoryFilter").val() || "";
  let list = products.slice();

  if (q) {
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }
  if (filterCat) {
    list = list.filter(p => p.category === filterCat);
  }

  const sort = $("#sortSelect").val();
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "newest") list.sort((a, b) => b.id.localeCompare(a.id));

  grid.empty();

  list.forEach(p => {
    const off = p.mrp > p.price ? Math.round(100 * (p.mrp - p.price) / p.mrp) : 0;
    
    const productImageHtmlString = p.stock? `<a href="product.html?id=${encodeURIComponent(p.id)}" class="ratio ratio-1x1 rounded-4 overflow-hidden bg-light">
          <img src="${p.thumbnail}" class="object-fit-cover" alt="${p.title}">
        </a>`:`<a href="product.html?id=${encodeURIComponent(p.id)}" class="ratio ratio-1x1 rounded-4 overflow-hidden bg-light">
          <img src="${p.thumbnail}" class="object-fit-cover out-of-stock-img" alt="${p.title}">
          <div class="out-of-stock-overlay">Out of Stock</div>
        </a>`;

      const addCartButtonHtmlString =  p.stock? `<button class="btn btn-dark btn-sm flex-fill addBtn" data-id="${p.id}"><i class="bi bi-bag-plus"></i> Add</button>`:`<button class="btn btn-dark btn-sm flex-fill addBtn disabled" data-id="${p.id}"><i class="bi bi-bag-plus" disabled></i> Add</button>`;
    const col = $("<div>").addClass("col-6 col-md-4 col-lg-3").html(`
      <div class="card h-100 border-0 shadow-sm">
        ${productImageHtmlString}
        <div class="card-body p-2">
          <div class="small text-muted">${p.category}</div>
          <h3 class="h6 m-0 text-truncate" title="${p.title}">${p.title}</h3>
          <div class="d-flex align-items-center gap-2">
            <strong>${formatCurrency(p.price)}</strong>
            ${off ? `<span class="text-muted text-decoration-line-through small">${formatCurrency(p.mrp)}</span>
            <span class="badge text-bg-success small">${off}% off</span>` : ""}
          </div>
          
          <div class="d-flex gap-2 mt-2">
            ${addCartButtonHtmlString}
            <a class="btn btn-outline-dark btn-sm" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
          </div>
        </div>
      </div>
    `);
    grid.append(col);
  });

  grid.find(".addBtn").off("click").on("click", function () {
    const id = $(this).data("id");
    const product = products.find(p => p.id === id);
    if (product) {
      openSizeModal(product);
    } else {
      alert("Product not found!");
    }
  });
}

function setSearchInputAndCategoryFilterAndSortSelectUsingBuildCards() {
  buildCards();
  $("#searchInput").on("input", buildCards);
  $("#categoryFilter").on("change", buildCards);
  $("#sortSelect").on("change", buildCards);
}

$(document).ready(async function () {
  await getProducts();
  setSearchInputAndCategoryFilterAndSortSelectUsingBuildCards();
  setProductCategories();
  updateCartBadge();

  // Set current year in footer
  $("#year").text(new Date().getFullYear());
});

function getSizeList(product) {
  if (!product || !product.sizes) return [];
  
}
