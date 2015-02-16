# DataToMusic #
Client-side JavaScript utility tools for data handling, mapping, and sound synthesis. Also wants to be a unique structure for networked musical abstracts but not quite there yet. It has several data structures / objects, such as dtm.array, dtm.model, etc. that has useful information and self-transforming methods. Most methods are chainable.

```
dtm.load('sample.csv').then(sonify);

function sonify(data) {
    var src = data.get(0);
    dtm.instr().pitch(src).play();
}
```

```
var a = dtm.array('hello world!');

a.rescale(60, 90).round();

dtm.clock().add(sonify).start();

function sonify(c) {
    dtm.synth().nn(a.get('next')).play();
}
```


![some diagram](JavaScript.png "diagram")

## How to Build ##
Dependencies:
Node.js and NPM ()
Bower (browser library management)
Grunt (task automation)
Karma and Jasmine (for unit test)
JSDoc (documentation builder)
Lodash (good stuff)

