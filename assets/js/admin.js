$(document).ready(async function () {
    initUploadSection('single');
    initUploadSection('multiple');
    const fieldRules = {
        '#productName': { regex: /[^a-zA-Z0-9 ]/g, max: 40 },
        '#productDescription': { regex: /[^a-zA-Z0-9_@$!%*?&. ]/g, max: 1024 },
        '#productPrice': { regex: /[^0-9.]/g, max: 10 },
        '#productMRP': { regex: /[^0-9.]/g, max: 10 },
        '#productCategory': { regex: /[^a-zA-Z0-9]/g, max: 20 },
        '#whatsappNumber': { regex: /[^0-9]/g, max: 10 },
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

    $("#settingsForm").on('submit', function (e) {
        e.preventDefault();

        const whatsappNumber = $("#whatsappNumber").val();
        if (!whatsappNumber || whatsappNumber.length !== 10) {
            notify("Please enter a valid 10-digit Whatsapp number", "danger");
            return;
        }
        // Perform AJAX request to save settings
        $.ajax({
            url: 'settings.php',
            type: 'POST',
            data: {
                action: 'update_settings',
                whatsappNumber: whatsappNumber
            },
            success: function (response) {
                if (response.success) {
                    notify(response.message, "success");
                } else {
                    notify(response.message, "danger");
                }
            },
            error: function () {
                notify('Error submitting form', "danger");
            }
        });
    });

    $('#createProductForm').on('submit', function (e) {
        e.preventDefault();

        const title = $("#productName").val();
        const description = $("#productDescription").val();
        const price = parseFloat($("#productPrice").val()) || 0;
        const mrp = parseFloat($("#productMRP").val()) || 0;
        const category = ($("#productCategory").val() === "new") ? $("#newCategory").val() : $("#productCategory").val();
        const stockStatus = $("#productStockStatus").val();

        const thumbnailFile = $('#single-upload-input')[0].files[0];
        const formData = new FormData();

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile); // replaces existing thumbnail entry
        } else {
            notify("Please select a thumbnail image", "danger");
            return;
        }

        const files = $('#multiple-upload-input')[0].files;
        [...files].forEach(file => {
            formData.append('images[]', file);
        });


        // Add selected sizes to form data
        const sizes = [];
        $('#sizesPanel input[type="checkbox"]:checked').each(function () {
            sizes.push($(this).val());

        });
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('mrp', mrp);
        formData.append('category', category);
        formData.append('stockStatus', stockStatus);
        formData.append('sizes', sizes.join(','));
        formData.append('action_type', 'create');

        // Send data to server
        $.ajax({
            url: 'actions.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    console.log(response.message, response)
                    notify(`this is message:${response.message}`, "success")
                    // Reset form
                    $('#createProductForm')[0].reset();
                    $('#sizesPanel').empty();
                    $('#single-preview-list').empty();
                    $('#multiple-preview-list').empty();
                } else {
                    notify(response.message, "danger");
                }
            },
            error: function () {
                notify('Error submitting form', "danger");
            }
        });
    });

    // Handle file selection
    $fileInput.on("change", function () {
        $preview.empty(); // Clear old previews

        $.each(this.files, function (_, file) {
            if (!file.type.startsWith("image/")) {
                notify(`${file.name} is not an image!`, "danger");
                return;
            }
            if (file.size > 1024 * 1024) {
                notify(`${file.name} is larger than 1MB!`, "danger");
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
    getSizes();
    renderSizesPanel();
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
    <table>
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
          <i class="fas fa-edit productEdit" style="color:#4caf50; margin-right:10px; cursor:pointer;" data-bs-toggle="modal"  data-bs-target="#editProductModal" data-id="${p.id}"></i>
          <i class="fas fa-trash productDelete" style="color:#f44336; cursor:pointer;" data-id="${p.id}"></i>
        </td>
      </tr>
    `;
    });

    html += `</tbody></table>`;

    $("#productsTableWrapper").html(html);

    renderPagination();
}


async function reloadPRoductsAndRender() {
    await getProducts();
    renderTable();
    renderCategorySelector();
    getSizes();
    renderSizesPanel();
}

function converIntToStockStatus(stock) {
    if (stock) return "InStock";
    else return "OutOfStock";
}

function convertStockStatusStringToBool(stockStatus) {
    if (stockStatus === "InStock") return true;
    if (stockStatus === "OutOfStock") return false;

}

$(document).on("click", ".productDelete", function () {
    //ask confirmation. say ut cannot be undone
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        return;
    }
    //get id from data-id attribute
    const id = $(this).data("id");
    if (!id) {
        notify("No product ID found", "danger");
        return;
    }
    $.ajax({
        url: "/admin/actions.php",
        method: "POST",
        data: {
            action_type: "delete",
            id: id
        },
        success: function (response) {
            if (response.success) {
                notify(response.message, "success");
            } else {
                notify(response.message, "danger");
            }
        },
        error: function () {
            notify("An error occurred while deleting the product", "danger");
        }
    });

    reloadProductsAndRender();
});

$(document).on("click", ".productEdit", function () {
    const id = $(this).data("id");
    const product = products.find(p => p.id === id);

    if (!product) {
        //TODO: Use notify instead of notify
        notify("Product not found", "danger");
        return;
    }

    const stockStatusStr = converIntToStockStatus(product.stock)
    // Fill modal fields with product data
    $("#editProductName").val(product.title);
    $("#editProductDescription").val(product.description);
    $("#editProductPrice").val(product.price);
    $("#editProductMRP").val(product.mrp);
    //fill the product categories from the productCategories array and select the product's category
    let categoryOptions = `<option value="">Select Category</option>`;
    $.each(productCategories, (i, category) => {
        categoryOptions += `<option value="${category}" ${category === product.category ? "selected"
            : ""}>${category}</option>`;
    });
    categoryOptions += `<option value="new">➕ New Category</option>`;
    $("#editProductCategory").html(categoryOptions);//select default values as product.category
    $("#editProductCategory").val(product.category);
    $("#editProductStockStatus").val(stockStatusStr);
    renderEditSizePanel(product.sizes)
    // Store productId somewhere hidden for update call
    $("#editProductForm").data("id", id);



});

function toggleNewCategoryInputEditSection() {
    console.log("toggling new category input in edit section");
    const category = $("#editProductCategory").val();
    const newCategoryGroup = $("#newCategoryGroupEdit");

    if (category === "new") {
        newCategoryGroup.show();   // jQuery method
    } else {
        newCategoryGroup.hide();   // jQuery method
    }
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

function renderEditSizePanel(currentSizes) {
    const sizesPanel = $("#eidtSizesPanel").empty();
    sizes.forEach(size => {

        const input = $(` <input type="checkbox" id="size${size}" name="sizes" value="${size}" hidden>`);
        const label = $(` <label for="size${size}" class="size-pill">${size}</label>`);
        sizesPanel.append(input);
        sizesPanel.append(label);
        //if size is in currentSizes array, then check the checkbox
        if (currentSizes.includes(size)) {
            input.prop("checked", true);
        }
    });

}

function renderCategorySelector() {
    const categorySelector = $("#productCategory")

    let html = `<option value="">Select Category</option>`;
    $.each(productCategories, (i, category) => {
        html += `<option value="${category}">${category}</option>`;
    });

    html += `<option value="new">➕ New Category</option>`;
    categorySelector.html(html);
}


function sortSizes() {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];
    sizes = sizes.sort((a, b) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);

        // If both are known sizes, compare by their index
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        // If only A is known, A comes first
        if (indexA !== -1) return -1;

        // If only B is known, B comes first
        if (indexB !== -1) return 1;

        // If both are unknown, sort alphabetically (or keep original order)
        return a.localeCompare(b);
    });
}

function getSizes(product) {
    sizes = [...new Set(products.flatMap(product => product.sizes))];
    const standardSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];
    sizes = [...new Set([...sizes, ...standardSizes])];
    sortSizes();
}



function renderSizesPanel() {
    const sizesPanel = $("#sizesPanel").empty();
    sizes.forEach(size => {
        const input = $(` <input type="checkbox" id="size${size}" name="sizes" value="${size}" hidden>`);
        const label = $(` <label for="size${size}" class="size-pill">${size}</label>`);
        sizesPanel.append(input);
        sizesPanel.append(label);
    });

}

function addNewSizes() {
    const input = $("#newSizesInput");
    const rawValue = input.val().trim();

    if (rawValue === "") {
        //TODO: USe notify instead of notify
        notify("Please enter at least one size.", "danger");
        return;
    }


    const newSizes = rawValue.split(",").map(s => s.trim()).filter(s => s !== "");
    //add new sizes to sizes array if not already present
    sizes = [...new Set([...sizes, ...newSizes])];
    sortSizes();

    input.val("");
    const modalEl = $("#addSizeModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    renderSizesPanel();
}

function initUploadSection(type) {
    const container = $(`#${type}-upload-container`);
    const input = $(`#${type}-upload-input`);
    const button = $(`#${type}-upload-btn`);
    const previewList = $(`#${type}-preview-list`);

    // Click on button to trigger file input
    button.on('click', function () {
        input.click();
    });

    // Handle file selection
    input.on('change', function (e) {
        handleFiles(e.target.files, type, previewList);

    });

    // Drag and drop events
    container.on('dragover', function (e) {
        e.preventDefault();
        container.addClass('drag-over');
    });

    container.on('dragleave', function (e) {
        e.preventDefault();
        container.removeClass('drag-over');
    });

    container.on('drop', function (e) {
        e.preventDefault();
        container.removeClass('drag-over');

        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files, type, previewList);
    });
}

function handleFiles(files, type, previewList) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.match('image.*')) {
            notify('Please select only image files', "danger");
            continue;
        }

        // Validate file size (1MB = 1,048,576 bytes)
        if (file.size > 1048576) {
            notify('File size must be less than 1MB', "danger");
            continue;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const previewItem = $(
                '<div class="preview-item">' +
                '<img class="preview-image" src="' + e.target.result + '" alt="Preview">' +
                '<div class="preview-remove"><i class="fas fa-times"></i></div>' +
                '<div class="preview-info">' + file.name + '</div>' +
                '</div>'
            );

            // Add remove functionality
            previewItem.find('.preview-remove').on('click', function () {
                previewItem.remove();
            });

            // For single upload, clear previous previews
            if (type === 'single') {
                previewList.empty();
            }

            previewList.append(previewItem);
        }

        reader.readAsDataURL(file);

        // For single upload, only process the first file
        if (type === 'single') {
            break;
        }
    }
}




// ===== EDIT PRODUCT =====
$("#editProductForm").on("submit", function (e) {
    e.preventDefault();
    const stockStatusBool = convertStockStatusStringToBool($("#productStockStatus").val());

    // Add selected sizes to form data
    const sizes = [];
    $('#editSizesPanel input[type="checkbox"]:checked').each(function () {
        sizes.push($(this).val());

    });
    const productData = {
        id: parseInt(("#editProductForm").data("product-id")), // set when oping modal
        name: $("#editProductName").val(),
        description: $("#editProductDescription").val(),
        sizes: sizes,
        price: parseFloat($("#editProductPrice").val()) || 0,
        mrp: parseFloat($("#editProductMRP").val()) || 0,
        category: ($("#editProductCategory").val() === "new") ? $("#newCategoryEdit").val() : $("#editProductCategory").val(),
        stockStatus: stockStatusBool,
        action_type: "edit"
    };


    // Call your backend function hello...
    $.ajax({
        url: "/admin/actions.php",
        method: "POST",
        data: productData,
        success: function (response) {
            if (response.success) {
                notify(response.message);
                $("#editProductModal").modal("hide");
                reloadProductsAndRender();
            } else {
                notify(response.message, "danger");
            }
        },
        error: function (error) {
            notify('Error updating product', "danger");
        }
    });

    // Close modal after save

});

function notify(msg, type = "info", timeout = 3000) {
    const box = $("#notifyBox");
    const notify = box.find(".notify");

    notify.removeClass()
        .addClass(`notify notify-${type} shadow`)
        .html(msg);

    box.stop(true, true).fadeIn(200);

    setTimeout(() => {
        box.fadeOut(400);
    }, timeout);
}