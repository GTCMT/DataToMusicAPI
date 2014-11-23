# DataToMusic #
Client-side JavaScript utility tools for data handling, mapping, and sound synthesis. Also wants to be a unique structure for networked musical abstracts but not quite there yet. It has several data structures / objects, such as dtm.array, dtm.model, etc. that has useful information and self-transforming methods. Most methods are chainable.

```
var a = dtm.array('hello world!');
console.log(a.classes);
console.log(a.values);

a.rescale(60, 90).round();
var i = dtm.iter(a);

dtm.clock(120, 8).add(sonify).start();

function sonify(c) {
    dtm.synth().nn(i.next()).play();
}
```

```
dtm.data('sample.csv').then(function (d) {
    // do something with the data object (d)
});
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

