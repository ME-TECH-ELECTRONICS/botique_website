$(document).ready(async function () {
    const fieldRules = {
        '#productName': { regex: /[^a-zA-Z0-9@.]/g, max: 40 },
        '#productDescription': { regex: /[^a-zA-Z0-9_@$!%*?&. ]/g, max: 1024 },
        '#productPrice': { regex: /[^0-9.]/g, max: 10 },
        '#productMRP': { regex: /[^0-9.]/g, max: 10 },
        '#productCategory': { regex: /[^a-zA-Z0-9]/g, max: 20 },
        // '#confirmPassword': { regex: /[^a-zA-Z0-9_@$!%*?&.]/g, max: 20 },
        // '#username': { regex: /[^a-zA-Z0-9_]/g, max: 15 },
        // '#registerEmail': { regex: /[^a-zA-Z0-9@.]/g, max: 40 },
        // '#forgotEmail': { regex: /[^a-zA-Z0-9@.]/g, max: 40 }
    };

    // Apply filtering and length limit
    $.each(fieldRules, function (selector, rule) {
        $(selector).on("input", function () {
            let val = this.value.replace(rule.regex, '');
            if (val.length > rule.max) {
                val = val.substring(0, rule.max);
            }
            this.value = val;
        });
    });

    const $fileInput = $("#productImages");
    const $preview = $("#preview");

    // Clicking box opens file dialog
    $("#uploadBox").on("click", function () {
        $fileInput.trigger("click");
    });

    // Handle file selection
    $fileInput.on("change", function () {
        $preview.empty(); // Clear old previews

        $.each(this.files, function (_, file) {
            if (!file.type.startsWith("image/")) {
                alert(`${file.name} is not an image!`);
                return;
            }
            if (file.size > 1024 * 1024) {
                alert(`${file.name} is larger than 1MB!`);
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                $("<img>").attr("src", e.target.result).appendTo($preview);
            };
            reader.readAsDataURL(file);
        });
    });
    await getProducts();
    renderTable();
    renderCategorySelector();
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


        // On mobile, close sidebar after selection
        if ($(window).width() < 992) {
            $('.sidebar').removeClass('show');
            $('.sidebar-overlay').removeClass('active');
        }
    });

    // Toggle sidebar
    $('.toggle-sidebar, .close-sidebar').click(function (e) {
        e.stopPropagation();
        $('.sidebar').toggleClass('show');
        $('.sidebar-overlay').toggleClass('active');
    });

    // Close sidebar when clicking outside
    $('.sidebar-overlay').click(function () {
        $('.sidebar').removeClass('show');
        $('.sidebar-overlay').removeClass('active');
    });

    // Close sidebar when clicking on main content on mobile
    $('.main-content').click(function () {
        if ($(window).width() < 992 && $('.sidebar').hasClass('show')) {
            $('.sidebar').removeClass('show');
            $('.sidebar-overlay').removeClass('active');
        }
    });

    // Handle window resize
    $(window).resize(function () {
        if ($(window).width() >= 992) {
            $('.sidebar').addClass('show');
            $('.sidebar-overlay').removeClass('active');
        } else {
            $('.sidebar').removeClass('show');
        }
    });

    // Initialize sidebar state based on screen size
    if ($(window).width() >= 992) {
        $('.sidebar').addClass('show');
    }

});


let currentPage = 1;
let pageSize = 10;

function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = products.slice(start, end);

    // build table
    let html = `
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Category</th>
          <th>Price</th>
          <th>MRP</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

    $.each(pageItems, (i, p) => {
        html += `
      <tr>
        <td>${p.id}</td>
        <td>${p.title}</td>
        <td>${p.category}</td>
        <td>₹${p.price}</td>
        <td>₹${p.mrp}</td>
        <td>${p.stock}</td>
        <td>
          <i class="fas fa-edit" style="color:#4caf50; margin-right:10px; cursor:pointer;"></i>
          <i class="fas fa-trash" style="color:#f44336; cursor:pointer;"></i>
        </td>
      </tr>
    `;
    });

    html += `</tbody></table>`;

    $("#productsTableWrapper").html(html);

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(products.length / pageSize);
    const pagination = $("#pagination").empty();

    for (let i = 1; i <= totalPages; i++) {
        $("<button>")
            .addClass("btn btn-sm " + (i === currentPage ? "btn-primary" : "btn-outline-primary"))
            .text(i)
            .on("click", () => { currentPage = i; renderTable(); })
            .appendTo(pagination)
            .css("margin-right", "5px");
    }
}

$("#pageSize").on("change", function () {
    pageSize = +$(this).val();
    currentPage = 1;
    renderTable();
});

function toggleNewCategoryInput() {
    const category = document.getElementById("productCategory").value;
    const newCategoryGroup = document.getElementById("newCategoryGroup");
    if (category === "new") {
        newCategoryGroup.style.display = "block";
    } else {
        newCategoryGroup.style.display = "none";
    }
}

function renderCategorySelector(){
    const categorySelector = $("#productCategories")

    let html = `<option value="">Select Category</option>`;
    $.each(productCategories, (i, category) => {
        html += `<option value="${category}"></option>`;
    });

    html += `<option value="new">➕ New Category</option>`;
    categorySelector.html(html);
}