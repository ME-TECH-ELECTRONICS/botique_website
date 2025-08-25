// Simple JavaScript for filter buttons and add to cart
document.addEventListener('DOMContentLoaded', function () {
    // Filter button active state
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart:not(:disabled)');
    const cartCount = document.querySelector('.cart-count');
    let count = parseInt(cartCount.textContent);

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            count++;
            cartCount.textContent = count;

            // Add animation effect
            const productCard = this.closest('.product-card');
            productCard.style.transform = 'scale(1.05)';
            setTimeout(() => {
                productCard.style.transform = '';
            }, 300);
        });
    });
});