//dtm.osc = function () {
//    var params = {};
//
//    var myOsc = {
//        type: 'dtm.osc',
//        oscPort: null,
//        isOpen: false
//    };
//
//    myOsc.setup = function () {
//        if (typeof(osc) !== 'undefined' && !myOsc.isOpen) {
//            myOsc.isOpen = true;
//            dtm.log('opening OSC port');
//            myOsc.oscPort = new osc.WebSocketPort({
//                url: 'ws://localhost:8081'
//            });
//
//            myOsc.oscPort.open();
//
//            myOsc.oscPort.listen();
//
//            myOsc.oscPort.on('ready', function () {
//                //myOsc.oscPort.socket.onmessage = function (e) {
//                //    console.log('test');
//                //    var foo =String.fromCharCode.apply(null, new Uint16Array(e));
//                //    console.log("message", e);
//                //};
//
//                myOsc.oscPort.on('message', function (msg) {
//                    switch (msg.address) {
//                        case '/test':
//                            //console.log(msg.args[0]);
//                            break;
//                        default:
//                            break;
//                    }
//                });
//
//                myOsc.oscPort.on("error", function (err) {
//                    throw new Error(err);
//                });
//            });
//        } else if (myOsc.isOpen) {
//            dtm.log('OSC port is already open');
//        }
//
//        return myOsc;
//    };
//
//    myOsc.start = myOsc.setup;
//
//    myOsc.stop = function () {
//        if (myOsc.oscPort) {
//            myOsc.oscPort.close(1000);
//        }
//
//        myOsc.isOpen = false;
//        return myOsc;
//    };
//
//    myOsc.close = myOsc.stop;
//
//    myOsc.on = function (addr, cb) {
//        myOsc.oscPort.on('message', function (msg) {
//            if (addr[0] !== '/') {
//                addr = '/'.concat(addr);
//            }
//            if (msg.address == addr) {
//                cb(msg.args);
//            }
//        });
//        return myOsc;
//    };
//
//    myOsc.write = function (addr, args) {
//        myOsc.oscPort.send({
//            address: addr,
//            args: args
//        });
//
//        return myOsc;
//    };
//
//    myOsc.send = myOsc.write;
//
//    myOsc.map = function (src, dest) {
//        if (dest.type === 'dtm.array') {
//            myOsc.oscPort.on('message', function (msg) {
//                switch (msg.address) {
//                    case '/test':
//                        dest.queue(msg.args[0]);
//                        break;
//                    default:
//                        break;
//                }
//            });
//        }
//
//        return myOsc;
//    };
//
//    myOsc.setup();
//    return myOsc;
//};

dtm.osc = {
    type: 'dtm.osc',
    oscPort: null,
    isOn: false,
    isOpen: false,
    callbacks: [],

    start: function () {
        if (typeof(osc) !== 'undefined' && !dtm.osc.isOpen) {
            dtm.osc.isOpen = true;
            dtm.log('opening OSC port');

            dtm.osc.oscPort = new osc.WebSocketPort({
                url: 'ws://localhost:8081'
            });

            dtm.osc.oscPort.open();

            dtm.osc.oscPort.listen();

            dtm.osc.oscPort.on('ready', function () {
                //dtm.osc.oscPort.socket.onmessage = function (e) {
                //    console.log('test');
                //    var foo =String.fromCharCode.apply(null, new Uint16Array(e));
                //    console.log("message", e);
                //};

                dtm.osc.oscPort.on('message', function (msg) {
                    switch (msg.address) {
                        case '/test':
                            //console.log(msg.args[0]);
                            break;
                        default:
                            break;
                    }
                });

                dtm.osc.oscPort.on("error", function (err) {
                    throw new Error(err);
                });
            });
        } else if (dtm.osc.isOpen) {
            dtm.log('OSC port is already open');
        }

        return dtm.osc;
    },

    stop: function () {
        if (dtm.osc.oscPort) {
            dtm.osc.oscPort.close(1000);
        }

        dtm.osc.isOpen = false;
        return dtm.osc;
    },


    on: function (addr, cb) {
        dtm.osc.oscPort.on('message', function (msg) {
            if (addr[0] !== '/') {
                addr = '/'.concat(addr);
            }
            if (msg.address == addr) {
                cb(msg.args);
            }
        });
        return dtm.osc;
    },

    send: function (addr, args) {
        if (addr[0] !== '/') {
            addr.unshift('/');
        }

        if (args.constructor !== Array) {
            args = [args];
        }

        dtm.osc.oscPort.send({
            address: addr,
            args: args
        });

        return dtm.osc;
    },

    clear: function () {
        dtm.osc.callbacks = [];
    }
};

dtm.osc.close = dtm.osc.stop;

