  $(document).ready(function () {
            // Toggle password visibility
            const email = $('#email');
            const password = $('#password');
            email.on('input', function () {
                let val = this.value.replace(/[^a-zA-Z0-9@.]/g, '');
                if (val.length > 40) {
                    val = val.substring(0, 40);
                }
                this.value = val;
            });

            password.on('input', function () {
                let val = this.value.replace(/[^a-zA-Z0-9_@$!%*?&.]/g, '');
                if (val.length > 20) {
                    val = val.substring(0, 20);
                }
                this.value = val;
            });

            $('#togglePassword').click(function () {
                const passwordField = $('#password');
                const passwordFieldType = passwordField.attr('type');
                const eyeIcon = $(this).find('i');

                if (passwordFieldType === 'password') {
                    passwordField.attr('type', 'text');
                    eyeIcon.removeClass('fa-eye').addClass('fa-eye-slash');
                } else {
                    passwordField.attr('type', 'password');
                    eyeIcon.removeClass('fa-eye-slash').addClass('fa-eye');
                }
            });

            // Form validation on submit
            $('#loginForm').submit(function (e) {
                e.preventDefault();
               
                let em = email.val().trim();
                let p = password.val().trim();
                console.log(em, p);
                if (!em) {
                    showError('emailGroup', 'emailError', 'Email is required');
                    return

                } else {
                    showSuccess('emailGroup');
                }

                if (!p) {
                    showError('passwordGroup', 'passwordError', 'Password is required');
                    return;
                } else {
                    showSuccess('passwordGroup');
                }

                // If form is valid, show success message
                
                    $('#successMessage').fadeIn();
                    // Reset form after 2 seconds (simulating redirect)
                    setTimeout(function () {
                        $('#loginForm')[0].reset();
                        $('#successMessage').fadeOut();
                        $('.input-group').removeClass('success');
                    }, 2000);

                return false;
            });

            // Helper functions
            function showError(groupId, errorId, message) {
                $(`#${groupId}`).addClass('error').removeClass('success');
                $(`#${errorId}`).text(message).fadeIn();
            }

            function showSuccess(groupId) {
                $(`#${groupId}`).removeClass('error').addClass('success');
                $(`#${groupId} .error-message`).fadeOut();
            }
        });