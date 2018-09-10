var Fiber = require('fibers');

function sleep(ms) {
    console.log('sleep... ' + new Date);
    var fiber = Fiber.current;
    setTimeout(function () {
        console.log('sleep... run ' + new Date);
        fiber.run();
    }, ms);
    console.log('sleep... yield ' + new Date);
    Fiber.yield();
}

setTimeout(function () {
    Fiber(function () {
        console.log('wait... ' + new Date);
        sleep(1000);
        console.log('ok... ' + new Date);
    }).run();

}, 1000);



function ddddsleep(ms) {
    console.log('sleep!!!!!!!... ' + new Date);
    var fiber = Fiber.current;
    setTimeout(function () {
        console.log('sleep!!!!!!!... run ' + new Date);
        fiber.run();
    }, ms);

    console.log('sleep!!!!!!!... yield ' + new Date);
    Fiber.yield();
}
setTimeout(function () {
    Fiber(function () {
        console.log('wait!!!!!!... ' + new Date);
        ddddsleep(50);
        console.log('ok!!!!!!!!!!!!... ' + new Date);
    }).run();

}, 1000);


console.log('back in main');