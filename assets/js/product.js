$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    await getProducts();
    updateCartBadge();

    const product = products.find(p => p.id === id);

    if (!product) {
        alert("Product not found!");
        window.location.href = "index.html";
        return;
    }

    const currency = "₹";

    // Set page title
    $("#pageTitle").text(`${product.title} — My Boutique`);

    // Main image
    const mainImg = $("#mainImg");
    mainImg.attr("src", product.images[0]);
    mainImg.attr("alt", product.title);

    // Thumbnails
    const thumbContainer = $("#thumbContainer");
    thumbContainer.html(
        product.images.map(img =>
            `<img src="${img}" width="56" height="56" class="rounded border thumb" alt="thumb">`
        ).join("")
    );
    thumbContainer.find("img").on("click", function () {
        mainImg.attr("src", $(this).attr("src"));
    });

    // Product info
    $("#productTitle").text(product.title);
    $("#productPrice").text(`${currency}${product.price.toLocaleString()}`);
    if (product.mrp > product.price) {
        $("#productMRP").text(`${currency}${product.mrp.toLocaleString()}`).show();
    }
    $("#productDescription").text(product.description);

    // Sizes
    const sizeContainer = $("#sizeContainer");
    const sizeOptions = $("#sizeOptions");
    if (product.sizes && product.sizes.length) {
        sizeContainer.show();
        sizeOptions.html(
            product.sizes.map((s, i) => `
            <input type="radio" class="btn-check" name="size" id="size-${s}" value="${s}" ${i === 0 ? "checked" : ""}>
            <label class="btn btn-outline-dark btn-sm rounded-pill" for="size-${s}">${s}</label>
        `).join("")
        );
    } else {
        sizeContainer.hide();
    }


    // Add to cart button
    $("#addToCartBtn").data("id", product.id);
});

// Product page add-to-cart
$(document).on("click", "#addToCartBtn", function () {
    const id = $(this).data("id");
    const picked = $('input[name="size"]:checked');
    const size = picked.length ? picked.val() : null;
    addToCart(id, size, 1);
    updateCartBadge();
});
