
var products = {};
var productCategories = [];
// }

document.addEventListener("DOMContentLoaded", async () => {
    // Call your PHP backend
    //here
    let resp = await fetch("/getProducts.php");
    products = resp.json();l
    productCategories =  [...new Set(products.map(p => p.category))];
    productCategories.sort();
        
    // let resp = await getProducts();
    // console.log(resp);

    // .then(response => {
    //   if (!response.ok) {
    //     throw new Error("Network response was not ok " + response.statusText);
    //   }
    //   return response.json(); // parse JSON response
    // })
    // .then(data => {
    //   // JSON structure: { "products": [ ... ] }
    //   const products = data.products;
    //   console.log(products); // ✅ see all products in console

    //   // Display them on the page
    //   let container = document.getElementById("product-list");
    //   products.forEach(p => {
    //     container.innerHTML += `
    //       <div style="margin-bottom:20px;">
    //         <h3>${p.title}</h3>
    //         <img src="${p.thumbnail}" width="150">
    //         <p>Price: ₹${p.price} <del>₹${p.mrp}</del></p>
    //         <p>Rating: ${p.rating} ⭐</p>
    //         <p>Category: ${p.category}</p>
    //         <p>Sizes: ${p.sizes.join(", ")}</p>
    //       </div>
    //     `;
    //   });
    // })
    // .catch(error => {
    //   console.error("Error fetching products:", error);
    // });

});


