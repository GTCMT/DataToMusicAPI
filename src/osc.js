dtm.osc = function () {
    var params = {};
    var myOsc = {
        type: 'dtm.osc',
        oscPort: null,
        isOpen: false
    };

    myOsc.setup = function () {
        if (typeof(osc) !== 'undefined' && !myOsc.isOpen) {
            console.log('opening OSC port');
            myOsc.oscPort = new osc.WebSocketPort({
                url: 'ws://localhost:8081'
            });

            myOsc.oscPort.open();
            myOsc.isOpen = true;

            myOsc.oscPort.listen();

            myOsc.oscPort.on('ready', function () {
                //myOsc.oscPort.socket.onmessage = function (e) {
                //    console.log('test');
                //    var foo =String.fromCharCode.apply(null, new Uint16Array(e));
                //    console.log("message", e);
                //};

                myOsc.oscPort.on('message', function (msg) {
                    switch (msg.address) {
                        case '/test':
                            //console.log(msg.args[0]);
                            break;
                        default:
                            break;
                    }
                });

                myOsc.oscPort.on("error", function (err) {
                    throw new Error(err);
                });
            });
        }

        return myOsc;
    };

    myOsc.start = myOsc.setup;

    myOsc.stop = function () {
        if (myOsc.oscPort) {
            myOsc.oscPort.close();
        }

        myOsc.isOpen = false;
        return myOsc;
    };

    myOsc.on = function (arg, cb) {
        myOsc.oscPort.on('message', function (msg) {
            switch (msg.address) {
                case '/test':
                    cb(msg.args[0]);
                    break;
                default:
                    break;
            }
        });
        return myOsc;
    };

    myOsc.write = function (input) {
        myOsc.oscPort.send({
            address: '/guido/score',
            args: ['set', input]
        });

        return myOsc;
    };


    myOsc.send = myOsc.write;

    myOsc.map = function (src, dest) {
        if (dest.type === 'dtm.array') {
            myOsc.oscPort.on('message', function (msg) {
                switch (msg.address) {
                    case '/test':
                        dest.queue(msg.args[0]);
                        break;
                    default:
                        break;
                }
            });
        }

        return myOsc;
    };


    myOsc.setup();
    return myOsc;
};

