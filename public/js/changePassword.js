let errorChangePw = $('#changePasswordModal .card-header .alert p').text();
if (errorChangePw) {
    alertify.error(errorChangePw);
}

// validate form
function validateFormChangePassword(event) {
    var curent_password = document.getElementById("curent_password").value;
    var new_password = document.getElementById("new_password").value;
    var comfirm_password = document.getElementById("comfirm_password").value;

    if(curent_password == ""){
        var mess = 'Please enter curent password!';
        alertify.error(mess);
        return false;
    }
    else if(new_password == "") {
        var mess = 'Please enter new password!';
        alertify.error(mess);
        return false;
    }
    else if(comfirm_password == "") {
        var mess = 'Please enter comfirm password!';
        alertify.error(mess);
        return false;
    }
    else if(new_password != comfirm_password) {
        var mess = 'Password confirmation does not match!';
        alertify.error(mess);
        return false;
    }
    else {
        // form xác nhận thay đổi
        var mess = '<b>Are you sure you want to change the password?</b>';
        alertify.set({ labels: { ok: "Ok", cancel: "Cancel" } });
        alertify.confirm( mess, function (e) {
            if (e) {
                // alertify.success("You've clicked OK");
                $('#changePasswordForm').submit();
                return true;
            } else {
                alertify.error("Canceled");
                return false;
                // alertify.error("You've clicked Cancel");
            }
        });
        // $('#edit_profile_form').submit();
        // return true;
    }
}