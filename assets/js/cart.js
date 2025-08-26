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

document.addEventListener("DOMContentLoaded", async () => {
    await getProducts();
    renderCartTable();   
});

