dtm.osc = function () {
    var params = {};
    var myOsc = {};

    myOsc.setup = function () {
        myOsc.oscPort = new osc.WebSocketPort({
            url: 'ws://localhost:8081'
        });

        myOsc.oscPort.open();

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

    return myOsc;
};