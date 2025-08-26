$(document).ready(function () {
    // Toggle password visibility
    const username = $('#username');
    const password = $('#password');
    username.on('input', function () {
        let val = this.value.replace(/[^a-zA-Z0-9@.]/g, '');
        if (val.length > 40) {
            val = val.substring(0, 40);
        }
        this.value = val;
    });

    password.on('input', function () {
        let val = this.value.replace(/[^a-zA-Z0-9_@$!%*?&.]/g, '');
        if (val.length > 40) {
            val = val.substring(0, 40);
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

        let em = username.val().trim();
        let p = password.val().trim();
        const captchaResponse = $("[name=cf-turnstile-response]").val();
        if (!em) {
            $('#errorMessage').text('Username is required.').fadeIn();
            return false;
        } else {
            $.ajax({
                url: 'login.php',
                method: 'POST',
                dataType: 'json',
                data: { username: em, password: p },
                success: function (response) {
                    if (response.success) {
                        $('#successMessage').text('Login successful!').addClass('success').removeClass('error').fadeIn();
                        setTimeout(function () {
                            $('#loginForm')[0].reset();
                            $('#successMessage').fadeOut();
                            window.location.href = 'index.php';
                        }, 2000);
                    } else {
                        $('#loginForm')[0].reset();
                        turnstile.reset('.cf-turnstile');
                        $('#successMessage').text(response.message).addClass('error').removeClass('success').fadeIn();
                        setTimeout(function () {
                            $('#successMessage').fadeOut();
                        }, 2000);
                    }
                }
            });

        }
    });
    
});