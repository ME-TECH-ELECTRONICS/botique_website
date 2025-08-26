$(document).ready(function () {
    // Handle menu item clicks
    $('.menu-item').click(function () {
        // Remove active class from all menu items
        $('.menu-item').removeClass('active');

        // Add active class to clicked menu item
        $(this).addClass('active');

        // Hide all content sections
        $('.content-section').removeClass('active');

        // Show the targeted content section
        const target = $(this).data('target');
        $(`#${target}`).addClass('active');
    });

    // Toggle sidebar on small screens
    $('.toggle-sidebar').click(function () {
        $('.sidebar').toggleClass('show');
    });

    // Responsive sidebar behavior
    function handleSidebar() {
        if ($(window).width() < 768) {
            $('.sidebar').addClass('mobile');
        } else {
            $('.sidebar').removeClass('mobile');
        }
    }

    // Initial call
    handleSidebar();

    // Call on window resize
    $(window).resize(handleSidebar);
});