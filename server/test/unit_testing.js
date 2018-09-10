var socket = require('socket.io-client')('http://127.0.0.1:8000');
socket.on('connect', function () {
    console.log('connect');
    socket.emit('protocol', { msg: 0 });


});
socket.on('protocol', function (data) {
    console.log(data);
    socket.emit('protocol', { msg: '0' });
});

// socket.on('news2222', function (data) {
//     console.log(data);
//     socket.emit('pro222', { abc: 'abcpro222' });
// });

socket.on('disconnect', function () {
    console.log('disconnect')
});
