<script src="../dtm.js"></script>
<script>
function playNext(elem) {
    try {
        var code = elem.nextElementSibling.getElementsByClassName('sunlight-highlight-javascript')[0].textContent;
        eval(code);
    } catch (e) {}
}

function playPrev(elem) {
    try {
        var code = elem.previousElementSibling.getElementsByClassName('sunlight-highlight-javascript')[0].textContent;
        eval(code);
    } catch (e) {
        alert(e);
    }
}
</script>


# DataToMusic
Client-side JavaScript utility tools for data musification (sonification). 

## Getting Started

```html
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Hello DTM</title>
    <script src="dtm.js"></script>
</head>
<body>
<script>
    dtm.synth().play();
</script>
</body>
</html>
```

## Loading data

    dtm.data('sample.csv', sonify);
    
    function sonify(data) {
        var src = data.get(0);
        dtm.instr().pitch(src).play();
    }

See the Data tutorial for more details.

## Mapping data to an instrument model

    data = 'hello';
    dtm.instr().pitch(data).speed(data).play();

<button onclick="playPrev(this)">Listen</button>

    var a = dtm.array('hello world!').split();
    a.class().range(60, 90).round().block(1);
    
    dtm.syn().play()
        .interval(0.1)
        .rep(a.len)
        .nn(a);
    
<button onclick="playPrev(this)">Listen</button>

## Building ##
Dependencies:
Node.js and NPM
Bower (browser dependency management)
Grunt (task automation)
Karma and Jasmine (for unit test)
JSDoc (documentation builder)
