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
    };

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
            formData.append('thumbnail', thumbnailFile);
        } else {
            notify("Please select a thumbnail image", "danger");
            return;
        }
        const files = $('#multiple-upload-input')[0].files;
        [...files].forEach(file => {
            formData.append('images[]', file);
        });
        const sizes = [];
        $('#sizesPanel input[type="checkbox"]:checked').each(function () {
            sizes.push($(this).val());

        });
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('mrp', mrp)
        formData.append('category', category);
        formData.append('stockStatus', stockStatus);
        formData.append('sizes', sizes.join(','));
        formData.append('action_type', 'create');
        $.ajax({
            url: 'actions.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    notify(`this is message:${response.message}`, "success")
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
        $preview.empty(); 
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
    $('.menu-item').click(function () {
        $('.menu-item').removeClass('active');
        $(this).addClass('active');
        $('.content-section').removeClass('active');
        const target = $(this).data('target');
        $(`#${target}`).addClass('active');
        if ($(window).width() < 992) {
            $('.sidebar').removeClass('show');
            $('.sidebar-overlay').removeClass('active');
        }
    });
    $('.toggle-sidebar, .close-sidebar').click(function (e) {
        e.stopPropagation();
        $('.sidebar').toggleClass('show');
        $('.sidebar-overlay').toggleClass('active');
    });
    $('.sidebar-overlay').click(function () {
        $('.sidebar').removeClass('show');
        $('.sidebar-overlay').removeClass('active');
    });
    $('.main-content').click(function () {
        if ($(window).width() < 992 && $('.sidebar').hasClass('show')) {
            $('.sidebar').removeClass('show');
            $('.sidebar-overlay').removeClass('active');
        }
    });
    $(window).resize(function () {
        if ($(window).width() >= 992) {
            $('.sidebar').addClass('show');
            $('.sidebar-overlay').removeClass('active');
        } else {
            $('.sidebar').removeClass('show');
        }
    });
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

async function reloadProductsAndRender() {
    await getProducts(true);
    await renderTable();
    await renderCategorySelector();
    await getSizes();
    await renderSizesPanel();
}

function converIntToStockStatus(stock) {
    if (stock) return "InStock";
    else return "OutOfStock";
}

function convertStockStatusStringToBool(stockStatus) {
    if (stockStatus === "InStock") return true;
    else if (stockStatus === "OutOfStock") return false;
    else { return false; }
}

$(document).on("click", ".productDelete", function () {
    const id = $(this).data("id");
    if (!id) return notify("No product ID found", "danger");
    $('#confirmationModal').modal('show');
    $('#confirmDeleteBtn').off('click').on('click', function () {
        $('#confirmationModal').modal('hide');
        $.ajax({
            url: "/admin/actions.php",
            method: "POST",
            dataType: 'json',
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
});

$(document).on("click", ".productEdit", function () {
    const id = $(this).data("id");
    const product = products.find(p => p.id === id);
    if (!product) return notify("Product not found", "danger");
    const stockStatusStr = converIntToStockStatus(product.stock)
    $("#editProductName").val(product.title);
    $("#editProductDescription").val(product.description);
    $("#editProductPrice").val(product.price);
    $("#editProductMRP").val(product.mrp);
    let categoryOptions = `<option value="">Select Category</option>`;
    $.each(productCategories, (i, category) => {
        categoryOptions += `<option value="${category}" ${category === product.category ? "selected"
            : ""}>${category}</option>`;
    });
    categoryOptions += `<option value="new">➕ New Category</option>`;
    $("#editProductCategory").html(categoryOptions);
    $("#editProductCategory").val(product.category);
    $("#editProductStockStatus").val(stockStatusStr);
    renderEditSizePanel(product.sizes)
    $("#editProductForm").data("id", id);

});

function toggleNewCategoryInputEditSection() {
    const category = $("#editProductCategory").val();
    const newCategoryGroup = $("#newCategoryGroupEdit");
    if (category === "new") {
        newCategoryGroup.show();
    } else {
        newCategoryGroup.hide();
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
    const sizesPanel = $("#editSizesPanel").empty();
    sizes.forEach(size => {

        const input = $(` <input type="checkbox" id="size${size}" name="sizes" value="${size}" hidden>`);
        const label = $(` <label for="size${size}" class="size-pill">${size}</label>`);
        sizesPanel.append(input);
        sizesPanel.append(label);
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
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });
}

let sizes = [];
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
    if (rawValue === "") return notify("Please enter at least one size.", "danger");
    const newSizes = rawValue.split(",").map(s => s.trim()).filter(s => s !== "");
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
    button.on('click', function () {
        input.click();
    });
    input.on('change', function (e) {
        handleFiles(e.target.files, type, previewList);

    });
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
        if (!file.type.match('image.*')) {
            notify('Please select only image files', "danger");
            continue;
        }
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
            previewItem.find('.preview-remove').on('click', function () {
                previewItem.remove();
            });
            if (type === 'single') {
                previewList.empty();
            }
            previewList.append(previewItem);
        }
        reader.readAsDataURL(file);
        if (type === 'single') {
            break;
        }
    }
}

// ===== EDIT PRODUCT =====
$("#editProductForm").on("submit", function (e) {
    e.preventDefault();
    const stockStatusBool = convertStockStatusStringToBool($("#editProductStockStatus").val());
    const sizes1 = [];
    $('#editSizesPanel input[type="checkbox"]:checked').each(function () {
        sizes1.push($(this).val());

    });
    const productData = {
        id: parseInt($("#editProductForm").data("id")),
        name: $("#editProductName").val(),
        description: $("#editProductDescription").val(),
        sizes: sizes1,
        price: parseFloat($("#editProductPrice").val()) || 0,
        mrp: parseFloat($("#editProductMRP").val()) || 0,
        category: ($("#editProductCategory").val() === "new") ? $("#newCategoryEdit").val() : $("#editProductCategory").val(),
        stockStatus: stockStatusBool,
        action_type: "edit"
    };
    $.ajax({
        url: "/admin/actions.php",
        method: "POST",
        data: productData,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                notify(response.message, "success");
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
});
$("#refreshProductsBtn").on("click", function() {
    reloadProductsAndRender();
});

function notify(message, type = "info", timeout = 3000) {
    var $toast = $('#myToast');
    console.log(type);
    $toast.removeClass('toast-success toast-danger toast-info');
    $toast.addClass(`toast-${type}`);
    $toast.find('.toast-body').text(message);
    var toast = new bootstrap.Toast($toast[0]);
    toast.show();
    setTimeout(() => {
        toast.hide();
    }, timeout);
}