<?php
  $data = json_decode(file_get_contents(__DIR__ . "/data/products.json"), true);
  $store = $data["store"];
  $products = $data["products"];
  $id = $_GET["id"] ?? "";
  $product = null;
  foreach ($products as $p) { if ($p["id"] === $id) { $product = $p; break; } }
  if (!$product) { header("Location: index.php"); exit; }
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($product["title"]) ?> — <?= htmlspecialchars($store["name"]) ?></title>
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
    <div class="ms-auto">
      <a class="btn btn-outline-dark position-relative" href="cart.php">
        <i class="bi bi-bag"></i>
        <span class="badge text-bg-dark position-absolute top-0 start-100 translate-middle rounded-pill" id="cartCount">0</span>
      </a>
    </div>
  </div>
</nav>

<main class="container py-4">
  <div class="row g-4">
    <div class="col-12 col-md-6">
      <div class="ratio ratio-1x1 rounded-4 border overflow-hidden bg-light">
        <img src="<?= htmlspecialchars($product["images"][0]) ?>" class="object-fit-cover" alt="<?= htmlspecialchars($product["title"]) ?>">
      </div>
      <div class="d-flex gap-2 mt-2">
        <?php foreach ($product["images"] as $img): ?>
          <img src="<?= htmlspecialchars($img) ?>" width="56" height="56" class="rounded border thumb" alt="thumb"
               onclick="document.querySelector('#mainImg').src=this.src">
        <?php endforeach; ?>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <h1 class="h4"><?= htmlspecialchars($product["title"]) ?></h1>
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="h5 m-0"><?= htmlspecialchars($store["currency"]) ?><?= number_format($product["price"]) ?></span>
        <?php if ($product["mrp"] > $product["price"]): ?>
          <span class="text-muted text-decoration-line-through"><?= htmlspecialchars($store["currency"]) ?><?= number_format($product["mrp"]) ?></span>
        <?php endif; ?>
        <span class="badge text-bg-success"><i class="bi bi-star-fill"></i> <?= htmlspecialchars($product["rating"]) ?></span>
      </div>
      <p class="text-muted"><?= htmlspecialchars($product["description"]) ?></p>
      <?php if (!empty($product["sizes"])): ?>
      <div class="mb-3">
        <label class="form-label">Size</label>
        <div class="d-flex flex-wrap gap-2">
          <?php foreach ($product["sizes"] as $s): ?>
            <input type="radio" class="btn-check" name="size" id="size-<?= htmlspecialchars($s) ?>" value="<?= htmlspecialchars($s) ?>">
            <label class="btn btn-outline-dark btn-sm rounded-pill" for="size-<?= htmlspecialchars($s) ?>"><?= htmlspecialchars($s) ?></label>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endif; ?>
      <div class="d-flex gap-2">
        <button class="btn btn-dark" id="addToCartBtn" data-id="<?= htmlspecialchars($product["id"]) ?>">Add to Cart</button>
        <a class="btn btn-outline-dark" href="cart.php">Go to Cart</a>
      </div>
      <div class="mt-3 small">
        <i class="bi bi-truck"></i> Pickup from home boutique · <i class="bi bi-arrow-repeat"></i> Easy WhatsApp support
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
