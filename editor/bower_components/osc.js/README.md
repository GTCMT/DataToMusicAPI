osc.js
======

osc.js is a library for reading and writing [Open Sound Control](http://opensoundcontrol.org) messages in JavaScript. It works in both Node.js and in a web browser.

Why osc.js?
-----------

There are several other OSC libraries available for JavaScript. However, most depend on Node.js-specific APIs. This means that they can't be run in a browser or on web-only platforms such as Chrome OS. osc.js uses only cross-platform APIs (`TypedArrays` and `DataView`), ensuring that it can run in any modern JavaScript environment.

osc.js is fast, comprehensive, fully spec-compliant, tested, modular, and provides a wide variety of optional transports for sending and receiving OSC data.

What Does it Do?
----------------

osc.js reads and writes OSC-formatted binary data into plain JavaScript objects. It provides adaptors for Node.js Buffer objects as well as standard ArrayBuffers.

The core of osc.js is transport agnostic. You can receive OSC data in whatever manner works best for your application: serial port APIs such as node-serialport or chrome.serial, socket APIs such as Node.js dgram or WebRTC data channels, WebSockets or binary XHR messages should all work. Connect osc.js up to your source of incoming/outgoing data, and you're all set. This approach is consistent with the design of Open Sound Control as a _content format_ that is independent from its means of transport.

In addition to the low-level encoder/decoder functions, osc.js also provides a comprehensive set of transport objects, called <code>Port</code>s, for use in standard browsers, Chrome Apps, and Node.js applications. These include:

<table>
    <tr>
        <th>Transport</th>
        <th>Supported Platforms</th>
    </tr>
    <tr>
        <td>UDP</td>
        <td>Node.js, Chrome Apps</td>
    </tr>
    <tr>
        <td>Serial port</td>
        <td>Node.js, Chrome Apps</td>
    </tr>
    <tr>
        <td>Web Sockets</td>
        <td>Browsers, Node.js, Chrome Apps</td>
    </tr>
    <tr>
        <td>TCP</td>
        <td>Node.js</td>
    </tr>
</table>

For stream-based protocols such as serial and TCP, osc.js will take care of SLIP framing for you.

Status
------

osc.js supports all OSC 1.0 and 1.1 required types. It supports all OSC 1.1 optional types except Int64s ("h"), since JavaScript numbers are represented as IEEE 754 Doubles and thus don't have sufficient precision to represent all 64 bits. Int64 support using Google's long library is planned in the future.

How it Works
------------

osc.js consists of two distinct layers:

1. The transports, which provide a simple EventEmitter-style API for sending an receiving OSC packets using a variety of transports such as UDP and Web Sockets.
2. The underlying stateless API that provides functions for reading and writing OSC packets.

Examples
--------

In-depth example osc.js applications for the browser, Node.js, and Chrome OS are available in the [osc.js examples repository](https://github.com/colinbdclark/osc.js-examples).

### Web Sockets in the Browser

The <code>osc.WebSocketPort</code> object supports sending and receiving
OSC messages over Web Sockets.

#### Options

<table>
    <tr>
        <th>Property</th>
        <th>Description</th>
        <th>Default Value</th>
    </tr>
    <tr>
        <td>url</td>
        <td>The Web Socket URL to connect to (_required for clients_)</td>
        <td>none</td>
    </tr>
</table>

#### Sample Code

##### Including osc.js in your HTML page:
```html
<!DOCTYPE html>
<html>
    <head>
        <title>osc.js Web Sockets</title>
        <meta charset="UTF-8" />
        <script src="bower_components/osc.js/dist/osc-browser.min.js"></script>
    </head>
    <body></body>
</html>
```

##### Creating an OSC Web Socket Port object:
```javascript
var oscPort = new osc.WebSocketPort({
    url: "ws://localhost:8081" // URL to your Web Socket server.
});
```

##### Listening for incoming OSC messages:
```javascript
oscPort.on("message", function (oscMsg) {
    console.log("An OSC message just arrived!", oscMsg);
});
```

##### Sending OSC messages:
```javascript
oscPort.send({
    address: "/carrier/frequency",
    args: 440
});
```

##### Sending OSC bundles:
```javascript
oscPort.send({
    timeTag: osc.timeTag(60), // Schedules this bundle 60 seconds from now.
    packets: [
        {
            address: "/carrier/frequency",
            args: 440
        },
        {
            address: "/carrier/amplitude"
            args: 0.5
        }
    ]
});
```

### Web Sockets in Node.js

The <code>osc.WebSocketPort</code> object supports sending and receiving
OSC messages over Web Sockets.

#### Options

<table>
    <tr>
        <th>Property</th>
        <th>Description</th>
        <th>Default Value</th>
    </tr>
    <tr>
        <td>url</td>
        <td>The Web Socket URL to connect to (_required for clients_)</td>
        <td>none</td>
    </tr>
    <tr>
        <td>socket</td>
        <td>A Web Socket instance to bind to (_required for servers_)</td>
        <td>none</td>
    </tr>
</table>

#### Sample Code

```javascript
var osc = require("osc"),
    http = require("http"),
    WebSocket = require("ws");

// Create an Express server app
// and serve up a directory of static files.
var app = require("express").express(),
    server = app.listen(8081);
app.use("/", express.static(__dirname + "/static"));

// Listen for Web Socket requests.
var wss = new WebSocket.Server({
    server: server
});

// Listen for Web Socket connections.
wss.on("connection", function (socket) {
    var socketPort = new osc.WebSocketPort({
        socket: socket
    });

    socketPort.on("message", function (oscMsg) {
        console.log("An OSC Message was received!", oscMsg);
    });
});
```

### UDP in Node.js

The <code>osc.UDPPort</code> object supports the sending and receiving of
OSC messages over Node.js's UDP sockets. It also supports multicast UDP.

#### Options

<table>
    <tr>
        <th>Property</th>
        <th>Description</th>
        <th>Default Value</th>
    </tr>
    <tr>
        <td>localPort</td>
        <td>The port to listen on (_required for UDP servers_)</td>
        <td>57121</td>
    </tr>
    <tr>
         <td>localAddress</td>
         <td>The local address to bind to; will be ignored in the case of multicast UDP (_required for UDP servers_)</td>
         <td>"127.0.0.1"</td>
    </tr>
    <tr>
        <td>remotePort</td>
        <td>The port to send messages on (_optional_)</td>
        <td>none</td>
    </tr>
    <tr>
        <td>remoteAddress</td>
        <td>The address to send messages to (_optional_)</td>
        <td>none</td>
    </tr>
    <tr>
        <td>multicast</td>
        <td>A flag determining whether to use multicast mode</td>
        <td>false</td>
    </tr>
    <tr>
        <td>multicastTTL</td>
        <td>The time to live (number of hops) fora multicast connection</td>
        <td>none</td>
    </tr>
</table>

#### Sample Code

```javascript
// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121
});

// Listen for incoming OSC bundles.
udpPort.on("bundle", function (oscBundle) {
    console.log("An OSC bundle just arrived!", oscBundle);
});

// Open the socket.
udpPort.open();

// Send an OSC message to, say, SuperCollider
udpPort.send({
    address: "/s_new",
    args: ["default", 100]
}, "127.0.0.1", 57110);
```

### Serial in a Chrome App

#### Including osc.js in your Chrome App page
```html
<script src="../bower_components/osc.js/dist/osc-chromeapp.min.js"></script>
```

#### Defining the appropriate permissions in manifest.json
```json
{
    "name": "OSC.js Chrome App Demo",
    "version": "1",
    "manifest_version": 2,
    "permissions": [
        "serial"
    ],
    "app": {
        "background": {
            "scripts": ["js/launch.js"],
            "transient": true
        }
    }
}
```

#### Connecting to the serial port and listening for OSC messages
```javascript
// Instantiate a new OSC Serial Port.
var serialPort = new osc.SerialPort({
    devicePath: "/dev/cu.usbmodem22131"
});

// Listen for the message event and map the OSC message to the synth.
serialPort.on("message", function (oscMsg) {
    console.log("An OSC message was received!", oscMsg);
});

// Open the port.
serialPort.open();
```

More code examples showing how osc.js can be used in browser-based, Node.js, and Chrome App applications can be found in the [osc.js examples repository](https://github.com/colinbdclark/osc.js-examples).

The osc.js Low-Level API
------------------------

There are two primary functions in osc.js used to read and write OSC data:

* ``osc.readPacket()``, which takes a DataView-friendly data buffer (i.e. an ArrayBuffer, TypedArray, DataView, or Node.js Buffer) and returns a tree of JavaScript objects representing the messages and bundles that were read
* ``osc.writePacket()``, which takes a message or bundle object and packs it up into a Uint8Array or Buffer object

Both functions take an optional `withMetadata` parameter, which specifies if the OSC type metadata should be included. By default, type metadata isn't included when reading packets, and is inferred automatically when writing packets.If you need greater precision in regards to the arguments in an OSC message, set the `withMetadata` argument to true.

### OSC Bundle and Message Objects

osc.js represents bundles and messages as (mostly) JSON-compatible objects. Here's how they are structured:

#### Messages
OSC Message objects consist of two properties, `address`, which contains the URL-style address path and `args` which is an array of either raw argument values or type-annotated Argument objects (depending on the value of `withMetadata` when reading the message).

```javascript
{
    address: "/an/osc/address",
    args: [
        {} // Raw or type-annotated OSC arguments
    ]
}
```

#### Bundles

OSC bundle objects consist of a time tag and an array of `packets`. Packets can be a mix of OSC bundle objects and message objects.

```javascript
{
    timeTag: {
        // OSC Time Tag object
    },
    packets: [
        {} // Nested OSC bundle and message objects>
    ]
}
```

#### Argument Objects with Type Metadata

Type-annotated argument objects contain two properties:  `type`, which contains the OSC type tag character (e.g. `"i"`, `"f"`, `"t"`, etc.) and the raw `value`.

```javascript
{
    type: "f", // OSC type tag string
    value: 444.4
}
```

#### Time Tags
Time tag objects contain two different representations: the raw NTP time and the equivalent (though less precise) native JavaScript timestamp. NTP times consist of a pair of values in an array. The first value represents the number of seconds since January 1, 1900. The second value is a Uint32 value (i.e. between 0 and 4294967296) that represents fractions of a second.

JavaScript timestamps are represented as milliseconds since January 1, 1970, which is the same unit as is returned by calls to `Date.now()`.

```javascript
{
    raw: [
        3608146800, // seconds since January 1, 1900.
        2147483648  // fractions of a second
    ],
    native: Number // Milliseconds since January 1, 1970
}
```
#### Colours
Colours are automatically normalized to CSS 3 rgba values (i.e. the alpha channel is represented as a float from `0.0` to `1.0`).

```javascript
{
    r: 255,
    g: 255,
    b: 255,
    a: 1.0
}
```

Mapping OSC to JSON
-------------------

Here are a few examples showing how OSC packets are mapped to JSON objects by osc.js.

<table>
    <tr>
        <th>Message</th>
        <th>Objects</th>
    </tr>
    <tr>
        <td>"/carrier/freq" ",f" 440.4</td>
        <td><pre><code>{
  address: "/carrier/freq",
  args: [440.4]
}</pre></code></td>
    </tr>
    <tr>
        <td>"/float/andArray" ",f[ii]" 440.4 42 47</td>
        <td><pre><code>{
  address: "/carrier/freq",
  args: [
    440.4, [42, 47]
  ]
}</pre></code></td>
    </tr>
    <tr>
        <td>"/aTimeTag" ",t" 3608146800 2147483648</td>
        <td><pre><code>{
  address: "/scheduleAt",
  args: [
    {
      raw: [3608146800, 2147483648],
      jsTime: 1399158000500
    }
  ]
}</code></pre>
    </tr>
    <tr>
        <td>"/blob" ",b" 0x63 0x61 0x74 0x21</td>
        <td><pre><code>
{
  address: "/blob",
  args: [
    Uint8Aray([0x63, 0x61, 0x74, 0x21])
  ]
}
    <tr>
        <td>"/colour" ",r" "255 255 255 255"</td>
        <td><pre><code>{
  address: "/colour",
  args: [{
      r: 255,
      g: 255,
      b: 255,
      a: 1.0
    }
  ]
}</pre></code</td>
    <tr>
        <td>"/midiMessage" ",m" 0x00 0x90 0x45 0x65</td>
        <td><pre><code>{
  address: "/midiMessage",
  args: [
    // Port ID, Status, Data 1, Data 2
    Uint8Array([0, 144, 69, 101])
  ]
}</pre></code</td>
</table>

License
-------

osc.js is written by Colin Clark and distributed under the MIT and GPL 3 licenses.
