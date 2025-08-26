document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    await getProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
        //show error and redirect to home
        alert("Product not found!");
        window.location.href = "index.html";
        return;
    }

    // Static store info
    const currency = "₹";

    // Set page title
    document.getElementById("pageTitle").textContent = `${product.title} — My Boutique`;

    // Main image
    const mainImg = document.getElementById("mainImg");
    mainImg.src = product.images[0];
    mainImg.alt = product.title;

    // Thumbnails
    const thumbContainer = document.getElementById("thumbContainer");
    thumbContainer.innerHTML = product.images.map(img =>
        `<img src="${img}" width="56" height="56" class="rounded border thumb" alt="thumb">`
    ).join("");
    thumbContainer.querySelectorAll("img").forEach(img => {
        img.addEventListener("click", () => mainImg.src = img.src);
    });

    // Product info
    document.getElementById("productTitle").textContent = product.title;
    document.getElementById("productPrice").textContent = `${currency}${product.price.toLocaleString()}`;
    if (product.mrp > product.price) {
        const mrpElem = document.getElementById("productMRP");
        mrpElem.textContent = `${currency}${product.mrp.toLocaleString()}`;
        mrpElem.style.display = "inline";
    }
    document.getElementById("productRating").innerHTML = `<i class="bi bi-star-fill"></i> ${product.rating}`;
    document.getElementById("productDescription").textContent = product.description;

    // Sizes
    const sizeContainer = document.getElementById("sizeContainer");
    const sizeOptions = document.getElementById("sizeOptions");
    if (product.sizes?.length) {
        sizeContainer.style.display = "block";
        sizeOptions.innerHTML = product.sizes.map(s => `
            <input type="radio" class="btn-check" name="size" id="size-${s}" value="${s}">
            <label class="btn btn-outline-dark btn-sm rounded-pill" for="size-${s}">${s}</label>
        `).join("");
    } else {
        sizeContainer.style.display = "none";
    }

    // Add to cart button
    document.getElementById("addToCartBtn").dataset.id = product.id;
});
