// load iamge
function readImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#profileModal img#image-upload').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$('#profileModal input#upload-path').change(function () {
    readImage(this);
});
// validate form
function validateFormEditProfile(event) {
    var firstname = document.getElementById("firstname").value;
    var lastname = document.getElementById("lastname").value;

    if(firstname == ""){
        var mess = '<b>Please enter your firstname!</b>';
        alertify.error(mess);
        return false;
    }
    else if(lastname == "") {
        var mess = '<b>Please enter your lastname!</b>';
        alertify.error(mess);
        return false;
    }
    else {
        // form xác nhận thay đổi
        var mess = '<b>Are you sure you want to save changes?</b>';
        alertify.set({ labels: { ok: "Ok", cancel: "Cancel" } });
        alertify.confirm( mess, function (e) {
            if (e) {
                // alertify.success("You've clicked OK");
                $('#edit_profile_form').submit();
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