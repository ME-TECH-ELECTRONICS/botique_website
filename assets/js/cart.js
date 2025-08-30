// Simple notification popup function
function notify(message, type = "info", timeout = 3000) {
  var $toast = $('#myToast');
  $toast.removeClass('toast-success toast-error toast-info');
  $toast.addClass(`toast-${type}`);
  $toast.find('.toast-body').text(message);
  var toast = new bootstrap.Toast($toast[0]);
  toast.show();
  setTimeout(() => {
    toast.hide();
  }, timeout);
}

$(document).ready(async function () {
  await getProducts();
  renderCartTable();

  $("#checkoutForm").on("submit", function (e) {
    e.preventDefault();

    const waNumber = "+916282902843";
    notify("Processing your order...", "info");

    const fd = new FormData(this);
    const name = fd.get("name")?.toString().trim();
    const phone = fd.get("phone")?.toString().trim();
    const address = fd.get("address")?.toString().trim();
    const pickup = fd.get("pickup")?.toString().trim();
    const notes = fd.get("notes")?.toString().trim();
    const cart = readCart();

    if (cart.length === 0) {
      notify("Your cart is empty.", "danger");
      return;
    }

    const map = Object.fromEntries(products.map(p => [p.id, p]));
    let lines = [`New order from ${name}`, "", "Items:"];

    cart.forEach(it => {
      const p = map[it.id];
      if (!p) return;
      lines.push(`• ${p.title}${it.size ? ` [${it.size}]` : ""} x ${it.qty} = ${formatCurrency(p.price * it.qty)}`);
    });

    const total = cart.reduce((s, it) => s + (map[it.id]?.price || 0) * it.qty, 0);
    lines.push(`Total: ${formatCurrency(total)}`);
    lines.push("", `Customer phone: ${phone}`, `Pickup address/landmark: ${address}`, `Preferred pickup: ${pickup || "-"}`);
    if (notes) lines.push("", `Notes: ${notes}`);

    const text = encodeURIComponent(lines.join("\n"));
    const waUrl = `https://wa.me/${waNumber}?text=${text}`;
    window.location.href = waUrl;

    // clear cart optionally
    localStorage.removeItem(CART_KEY);
  });
});
