// Minimal storefront logic
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));


const currency = "₹";
const waNumber = +919447393193; // change to your WhatsApp number

function formatCurrency(n){ return currency + (Number(n)||0).toLocaleString(); }







function setProductCategories(){
  const select = document.getElementById(categoryFilter);
  if (!select) return;

  // Clear old options
  select.innerHTML = "";

  
  // Append options
  cats.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    select.appendChild(option);
  });
}



// Build product cards on index
function buildCards(){
  const grid = $("#productGrid");
  if(!grid || !products) return;
  const q = ($("#searchInput")?.value || "").toLowerCase();
  const filterCat = $("#categoryFilter")?.value || "";
  let list = products.slice();

  if(q){
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  if(filterCat){
    list = list.filter(p => p.category === filterCat);
  }
  const sort = $("#sortSelect")?.value;
  if(sort === "price-asc") list.sort((a,b)=>a.price-b.price);
  if(sort === "price-desc") list.sort((a,b)=>b.price-a.price);
  if(sort === "rating-desc") list.sort((a,b)=>b.rating-a.rating);
  if(sort === "newest") list.sort((a,b)=>b.id.localeCompare(a.id));

  grid.innerHTML = "";
  list.forEach(p => {
    const off = p.mrp>p.price ? Math.round(100*(p.mrp - p.price)/p.mrp) : 0;
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="ratio ratio-1x1 rounded-4 overflow-hidden bg-light">
          <img src="${p.thumbnail}" class="object-fit-cover" alt="${p.title}">
        </a>
        <div class="card-body p-2">
          <div class="small text-muted">${p.category}</div>
          <h3 class="h6 m-0 text-truncate" title="${p.title}">${p.title}</h3>
          <div class="d-flex align-items-center gap-2">
            <strong>${formatCurrency(p.price)}</strong>
            ${off?`<span class="text-muted text-decoration-line-through small">${formatCurrency(p.mrp)}</span>
            <span class="badge text-bg-success small">${off}% off</span>`:""}
          </div>
          <div class="d-flex align-items-center gap-1 small text-warning">
            <i class="bi bi-star-fill"></i> <span>${p.rating}</span>
          </div>
          <div class="d-flex gap-2 mt-2">
            <button class="btn btn-dark btn-sm flex-fill addBtn" data-id="${p.id}"><i class="bi bi-bag-plus"></i> Add</button>
            <a class="btn btn-outline-dark btn-sm" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
          </div>
        </div>
      </div>`;
    grid.appendChild(col);
  });

  $$(".addBtn", grid).forEach(btn => {
    btn.addEventListener("click", e => {
      const id = btn.dataset.id;
      addToCart(id, null, 1);
    });
  });
}

// Product page add-to-cart
document.addEventListener("click", (e)=>{
  if(e.target?.id === "addToCartBtn"){
    const id = e.target.dataset.id;
    const picked = document.querySelector('input[name="size"]:checked');
    const size = picked ? picked.value : null;
    addToCart(id, size, 1);
  }
});



function setSearchInputAndCategoryFilterAndSortSelectUsingBuildCards(){
    buildCards();
    $("#searchInput")?.addEventListener("input", buildCards);
    $("#categoryFilter")?.addEventListener("change", buildCards);
    $("#sortSelect")?.addEventListener("change", buildCards);
}

document.addEventListener("DOMContentLoaded", async () => {
  await getProducts();
  setSearchInputAndCategoryFilterAndSortSelectUsingBuildCards();
  setProductCategories();
  updateCartBadge();
  // Set current year in footer
  $("#year") && ($("#year").textContent = new Date().getFullYear());
 
});

