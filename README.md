# Data-to-Music API
A browser-based JavaScript API for real-time data sonification. Try the [interactive editor](https://ttsuchiya.github.io/dtm/) with [documentations](https://ttsuchiya.github.io/dtm/doc).

## How to use
Load the library into your web application as a global variable ```dtm``` by including ```dtm.js``` or ```dtm.min.js``` in the HTML file.

```html
<html>
<head>
    <title>Hello DTM</title>
    <script src="dtm.js"></script>
</head>
<body>
<script>
    var a = dtm.data(1,2,3,4,5);
    dtm.music().note(a.range(60,90)).play();
</script>
</body>
</html>
```

See the tutorials in documentation as well as the modules `dtm.data` and `dtm.music` for more details.

## Building ##
Dependencies:
Node.js and NPM
Bower (browser dependency management)
Grunt (task automation)
Karma and Jasmine (unit testing)
JSDoc (documentation builder)

## Credits ##
Open-source libraries used in the DTM API: 
<a href="https://sourceforge.net/projects/kissfft">Kiss FFT</a>