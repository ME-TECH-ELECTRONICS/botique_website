 $(document).ready(function() {
            // Menu navigation
            $(".menu-link").click(function(e) {
                e.preventDefault();
                
                // Update active menu item
                $(".menu-link").removeClass("active");
                $(this).addClass("active");
                
                // Show corresponding content
                const target = $(this).data("target");
                $(".content-section").removeClass("active-content");
                
                if (target === "dashboard") {
                    $("#dashboard-content").addClass("active-content");
                } else if (target === "products") {
                    $("#products-content").addClass("active-content");
                } else if (target === "create-product") {
                    $("#create-product-content").addClass("active-content");
                }
            });
            
            // Add product button click
            $("#add-product-btn").click(function() {
                $(".menu-link").removeClass("active");
                $('.menu-link[data-target="create-product"]').addClass("active");
                $(".content-section").removeClass("active-content");
                $("#create-product-content").addClass("active-content");
            });
            
            // Image upload handling
            $("#image-upload-area").click(function() {
                $("#product-images").click();
            });
            
            $("#product-images").change(function() {
                const files = this.files;
                const preview = $("#image-preview");
                preview.empty();
                
                if (files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            const img = $("<img>").attr("src", e.target.result).css({
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "5px"
                            });
                            preview.append(img);
                        }
                        
                        reader.readAsDataURL(file);
                    }
                }
            });
            
            // Drag and drop for images
            $("#image-upload-area").on("dragover", function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).css("border-color", "#6a11cb");
            });
            
            $("#image-upload-area").on("dragleave", function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).css("border-color", "#ddd");
            });
            
            $("#image-upload-area").on("drop", function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).css("border-color", "#ddd");
                
                const files = e.originalEvent.dataTransfer.files;
                $("#product-images").prop("files", files);
                
                // Trigger change event to update preview
                $("#product-images").trigger("change");
            });
            
            // Form submission
            $("#product-form").submit(function(e) {
                e.preventDefault();
                
                // Basic validation
                const name = $("#product-name").val();
                const price = $("#product-price").val();
                
                if (!name || !price) {
                    alert("Please fill in all required fields.");
                    return;
                }
                
                // In a real application, you would send the data to the server here
                alert("Product created successfully!");
                $("#product-form")[0].reset();
                $("#image-preview").empty();
            });
        });