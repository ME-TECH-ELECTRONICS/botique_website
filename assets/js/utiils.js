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