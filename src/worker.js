addEventListener('message', function (e) {
    var data = e.data;
    postMessage(data);
}, false);