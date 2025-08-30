
var products = [];
var productCategories = [];
// }
let isProductsLoaded = false
async function getProducts(isReload = false) {
    // Call your PHP backend
    //here
    if(isProductsLoaded && !isReload) return;
    let resp = await fetch("/getProducts.php");
    products =  await resp.json();


    productCategories =  [...new Set(products.map(p => p.category))];
    productCategories.sort();

    isProductsLoaded = true;

}


