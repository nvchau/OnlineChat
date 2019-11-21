import moment from "moment";

// lấy phần tử cuối của mảng
export let lastItemOfArray = (array) => {
    if(!array.length) {
        return [];
    }
    return array[array.length - 1];
}

// trả timestamp về humantime | sử dụng momentjs
export let convertTimestampToHumanTime = (timestamp) {
    if (!timestamp){
        return "";
    }
    return moment(timestamp).locale("vi").startOf("seconds").fromNow();
}