const CART_KEY = "luttu_cart_v1";

function readCart(){
  try{
     return JSON.parse(localStorage.getItem(CART_KEY)) || []; 
   }
 catch{ return []; }
}

function updateCartBadge(){
  const count = readCart().reduce((s,it)=>s+it.qty,0);
  const el = $("#cartCount"); if(el) el.textContent = count;
}
function writeCart(items){
     localStorage.setItem(CART_KEY, JSON.stringify(items));
      updateCartBadge(); 
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
