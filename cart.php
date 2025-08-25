<?php
  $data = json_decode(file_get_contents(__DIR__ . "/data/products.json"), true);
  $store = $data["store"];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cart — <?= htmlspecialchars($store["name"]) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <link href="assets/css/styles.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-expand-lg bg-body sticky-top border-bottom">
  <div class="container">
    <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="index.php">
      <img src="assets/img/logo.jpg" width="28" height="28" alt="Logo"> <?= htmlspecialchars($store["name"]) ?>
    </a>
  </div>
</nav>

<main class="container py-4">
  <h1 class="h4 mb-3">Your Cart</h1>
  <div class="row g-4">
    <div class="col-12 col-lg-8">
      <div class="card rounded-4 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table align-middle m-0">
              <thead class="table-light">
                <tr>
                  <th>Product</th>
                  <th class="text-center">Price</th>
                  <th class="text-center">Qty</th>
                  <th class="text-end pe-3">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="cartTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-lg-4">
      <div class="card rounded-4 shadow-sm">
        <div class="card-body">
          <h2 class="h6">Order Summary</h2>
          <div class="d-flex justify-content-between"><span>Items</span><span id="sumItems">0</span></div>
          <div class="d-flex justify-content-between"><span>Total</span><strong id="sumTotal"><?= htmlspecialchars($store["currency"]) ?>0</strong></div>
          <hr>
          <form id="checkoutForm" class="vstack gap-2">
            <input class="form-control" name="name" placeholder="Your Name" required>
            <input class="form-control" name="phone" placeholder="Phone (WhatsApp)" required>
            <input class="form-control" name="address" placeholder="Pickup address / landmark" required>
            <input class="form-control" name="pickup" placeholder="Preferred pickup date & time">
            <textarea class="form-control" name="notes" placeholder="Any notes"></textarea>
            <button type="submit" class="btn btn-success w-100">
              <i class="bi bi-whatsapp"></i> Place Order on WhatsApp
            </button>
          </form>
          <p class="small text-muted mt-2">You will be redirected to WhatsApp with your order details. Payment is handled outside the site.</p>
        </div>
      </div>
    </div>
  </div>
</main>

<script>
  window.__STORE__ = <?php echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
