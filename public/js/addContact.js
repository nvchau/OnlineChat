function addContact() {
    $('.user-add-new-contact').bind('click', function() {
        let targetId = $(this).data('uid');
        $.post('/contact/add-new', {uid: targetId}, function(data) {
            if (data.success) {
                $('#find-user').find(`div.user-add-new-contact[data-uid] = ${targetId}`).hide();
                $('#find-user').find(`div.user-remove-request-contact[data-uid] = ${targetId}`).css('display', 'none');
                increaseNumberNotifContact('coutn-request-contact-snet');
                socket.emit('add-new-contact', {contactId: targetId});
            }
        })
    })
}