const CART_KEY = "luttu_cart_v1";

const currency = "₹";
function formatCurrency(n) { 
  return currency + (Number(n) || 0).toLocaleString(); 
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function updateCartBadge() {
  const count = readCart().reduce((s, it) => s + it.qty, 0);
  const el = $("#cartCount");
  if (el.length) el.text(count); // ✅ use .text() instead of textContent
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

function addToCart(id, size, qty = 1) {
  const cart = readCart();
  const existing = cart.find(it => it.id === id && it.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, size, qty });
  }
  writeCart(cart);
}

function updateQty(id, delta, size) {
  const cart = readCart();  
  const idx = cart.findIndex(it => it.id === id && it.size === size);
  if (idx > -1) {
    let qty = cart[idx].qty + delta;
    if(qty <= 0) {
      // Remove item if qty goes to zero or below
     removeItem(id, size);
     return;
    }
    cart[idx].qty = qty;
    writeCart(cart);
    renderCartTable();
  }
}

// Cart table render + checkout
function renderCartTable() {
  const body = $("#cartTableBody");
  if (!body.length) return;

  const map = Object.fromEntries(products.map(p => [p.id, p]));
  const cart = readCart();
  let total = 0, items = 0;

  body.empty(); // ✅ instead of body.innerHTML = ""

  cart.forEach(it => {
    const p = map[it.id];
    if (!p) return;

    const sub = p.price * it.qty;
    total += sub; 
    items += it.qty;

    // ✅ use jQuery to build row
    const tr = $("<tr>").html(`
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${p.thumbnail}" width="56" height="56" class="rounded border object-fit-cover">
          <div>
            <div class="fw-semibold">${p.title}</div>
            ${it.size ? `<div class="small text-muted">Size: ${it.size}</div>` : ""}
          </div>
        </div>
      </td>
      <td class="text-center">${formatCurrency(p.price)}</td>
      <td class="text-center">
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn btn-outline-secondary" onclick="updateQty(${it.id},-1,'${it.size ?? ""}')">-</button>
          <button class="btn btn-outline-secondary" disabled>${it.qty}</button>
          <button class="btn btn-outline-secondary" onclick="updateQty(${it.id},1,'${it.size ?? ""}')">+</button>
        </div>
      </td>
      <td class="text-end pe-3">${formatCurrency(sub)}</td>
      <td class="text-end">
        <button class="btn btn-link text-danger" onclick="removeItem(${it.id},'${it.size ?? ""}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `);

    body.append(tr);
  });

  $("#sumItems").text(items);
  $("#sumTotal").text(formatCurrency(total));
}

function removeItem(id, size) {
  const cart = readCart().filter(it => !(it.id === id && it.size === size));
  writeCart(cart);
  renderCartTable();
}
