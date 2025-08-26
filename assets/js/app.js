// Minimal storefront logic
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));


const currency = "₹";
const waNumber = +919447393193; // change to your WhatsApp number

function formatCurrency(n){ return currency + (Number(n)||0).toLocaleString(); }

const CART_KEY = "luttu_cart_v1";

function readCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch{ return []; }
}
function writeCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartBadge(); }
function updateQty(id, delta, size){
  const cart = readCart();
  const idx = cart.findIndex(it => it.id===id && it.size===size);
  if(idx>-1){
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    writeCart(cart);
    renderCartTable();
  }
}
function removeItem(id, size){
  const cart = readCart().filter(it => !(it.id===id && it.size===size));
  writeCart(cart);
  renderCartTable();
}
function addToCart(id, size=null, qty=1){
  const cart = readCart();
  const existing = cart.find(it => it.id===id && it.size===size);
  if(existing){ existing.qty += qty; }
  else{
    cart.push({ id, size, qty });
  }
  writeCart(cart);
}

function updateCartBadge(){
  const count = readCart().reduce((s,it)=>s+it.qty,0);
  const el = $("#cartCount"); if(el) el.textContent = count;
}

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

document.addEventListener("DOMContentLoaded", setProductCategories);

document.addEventListener("DOMContentLoaded", updateCartBadge);

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
        <a href="product.php?id=${encodeURIComponent(p.id)}" class="ratio ratio-1x1 rounded-4 overflow-hidden bg-light">
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
            <a class="btn btn-outline-dark btn-sm" href="product.php?id=${encodeURIComponent(p.id)}">View</a>
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
document.addEventListener("DOMContentLoaded", () => {
  $("#year") && ($("#year").textContent = new Date().getFullYear());
  buildCards();
  $("#searchInput")?.addEventListener("input", buildCards);
  $("#categoryFilter")?.addEventListener("change", buildCards);
  $("#sortSelect")?.addEventListener("change", buildCards);
});

// Product page add-to-cart
document.addEventListener("click", (e)=>{
  if(e.target?.id === "addToCartBtn"){
    const id = e.target.dataset.id;
    const picked = document.querySelector('input[name="size"]:checked');
    const size = picked ? picked.value : null;
    addToCart(id, size, 1);
  }
});

// Cart table render + checkout
function renderCartTable(){
  const body = $("#cartTableBody");
  if(!body) return;
  const map = Object.fromEntries(products.map(p => [p.id, p]));
  const cart = readCart();
  let total = 0, items = 0;
  body.innerHTML = "";
  cart.forEach(it => {
    const p = map[it.id]; if(!p) return;
    const sub = p.price * it.qty;
    total += sub; items += it.qty;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${p.thumbnail}" width="56" height="56" class="rounded border object-fit-cover">
          <div>
            <div class="fw-semibold">${p.title}</div>
            ${it.size?`<div class="small text-muted">Size: ${it.size}</div>`:""}
          </div>
        </div>
      </td>
      <td class="text-center">${formatCurrency(p.price)}</td>
      <td class="text-center">
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn btn-outline-secondary" onclick="updateQty('${it.id}',-1,'${it.size??""}')">-</button>
          <button class="btn btn-outline-secondary" disabled>${it.qty}</button>
          <button class="btn btn-outline-secondary" onclick="updateQty('${it.id}',1,'${it.size??""}')">+</button>
        </div>
      </td>
      <td class="text-end pe-3">${formatCurrency(sub)}</td>
      <td class="text-end"><button class="btn btn-link text-danger" onclick="removeItem('${it.id}','${it.size??""}')"><i class="bi bi-trash"></i></button></td>
    `;
    body.appendChild(tr);
  });
  $("#sumItems").textContent = items;
  $("#sumTotal").textContent = formatCurrency(total);
}
document.addEventListener("DOMContentLoaded", renderCartTable);

$("#checkoutForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get("name")?.toString().trim();
  const phone = fd.get("phone")?.toString().trim();
  const address = fd.get("address")?.toString().trim();
  const pickup = fd.get("pickup")?.toString().trim();
  const notes = fd.get("notes")?.toString().trim();
  const cart = readCart();
  if(cart.length===0){ alert("Your cart is empty."); return; }

  const map = Object.fromEntries(products.map(p => [p.id, p]));
  let lines = [`New order from ${name}`, "", "Items:"];
  cart.forEach(it => {
    const p = map[it.id];
    if(!p) return;
    lines.push(`• ${p.title}${it.size?` [${it.size}]`:""} x ${it.qty} = ${formatCurrency(p.price*it.qty)}`);
  });
  const total = cart.reduce((s,it)=> s + (map[it.id]?.price||0)*it.qty, 0);
  lines.push(`Total: ${formatCurrency(total)}`);
  lines.push("", `Customer phone: ${phone}`, `Pickup address/landmark: ${address}`, `Preferred pickup: ${pickup||"-"}`);
  if(notes) lines.push("", `Notes: ${notes}`);

  const text = encodeURIComponent(lines.join("\n"));
  const waUrl = `https://wa.me/${waNumber}?text=${text}`;
  window.location.href = waUrl;
  // clear cart optionally
  // localStorage.removeItem(CART_KEY);
});

