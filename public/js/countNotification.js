// đếm tăng số lượng thông báo ở các mục contact management
function increaseRequestContactNumber(className) {
    let currentValue = +$(`.${className}`).find("em").text(); // dấu cộng phía trước để chuyển string thành number - nếu rỗng thì mặc định trả về là số 0
    currentValue += 1;
    if (currentValue === 0) {
        $(`.${className}`).html('');
    } else {
        $(`.${className}`).html(`(<em>${currentValue}</em>)`);
    }
}
// đếm giảm số lượng thông báo ở các mục contact management
function decreaseRequestContactNumber(className) {
    let currentValue = +$(`.${className}`).find("em").text(); // dấu cộng phía trước để chuyển string thành number - nếu rỗng thì mặc định trả về là số 0
    currentValue -= 1;
    if (currentValue === 0) {
        $(`.${className}`).html('');
    } else {
        $(`.${className}`).html(`(<em>${currentValue}</em>)`);
    }
}

// đếm số lượng thông báo tăng trên navbar
function increaseRequestNotification(className, number) { // className: tên class của div, number: số lượng muốn tăng
    let currentValue = +$(`.${className}`).text(); // dấu cộng phía trước để chuyển string thành number - nếu rỗng thì mặc định trả về là số 0
    currentValue += number;
    if (currentValue === 0) {
        $(`.${className}`).css('display', 'none').html('');
    } else {
        $(`.${className}`).css('display', 'block').html(currentValue);
    }
}
// đếm số lượng thông báo giảm trên navbar
function decreaseRequestNotification(className, number) {
    let currentValue = +$(`.${className}`).text(); // dấu cộng phía trước để chuyển string thành number - nếu rỗng thì mặc định trả về là số 0
    currentValue -= number;
    if (currentValue === 0) {
        $(`.${className}`).css('display', 'none').html('');
    } else {
        $(`.${className}`).css('display', 'block').html(currentValue);
    }
}