# ICAD 2017 Workshop: Live Coding Sonification Systems for/on Web Browsers
Instructor: Takahiko Tsuchiya (takahiko@gatech.edu)

This workshop will introduce Data-to-Music (DTM) API, a tool set for general-purpose sonification, and explore various ways of designing real-time sonification algorithms that work on common web browsers.

## 0. Before We Begin
### What you need
- A laptop.
- A recent version of Chrome (recommended), FireFox, Safari, or Edge installed.

### Resources
[DTM API](https://raw.githubusercontent.com/GTCMT/DataToMusicAPI/master/dtm.js): The library file to include in our web applications. Please download this to your local drive.
[Online Editor](https://ttsuchiya.github.io/dtm/): An interactive live-coding [editor](https://ttsuchiya.github.io/dtm/editor) with [documentation](https://ttsuchiya.github.io/dtm/doc) (opens them separately).
[Data Sets](https://vincentarelbundock.github.io/Rdatasets/datasets.html): The data sets distributed with R.

### Optional Resources
[DTM Source Code](https://github.com/GTCMT/DataToMusicAPI): Post issues or questions here. Please don't look at the source code! 
[Workshop Examples](http://bit.ly/icad2017_dtm_examples): It's empty now. I will be adding examples during the workshop as we go.

## 1. Getting Started
There are multiple ways to run DTM in web browsers. As with anything, Google search is your friend... but this mini tutorial provides the first steps for the absolute beginners in web development to use DTM.

### Minimum Components of a Web Application 
DTM API is a JavaScript (JS) file. Although you *can* run a JS directly in your browser (e.g., [method 1](https://stackoverflow.com/questions/5282228/include-javascript-file-in-chrome-console), [method 2](https://github.com/mathisonian/requirify)), it is usually much easier to create a simple web page that includes the library file.

A simple web page can be made of a HTML + JavaScript. 

- HTML: Holds static data (e.g., text), and load *some* resources directly such as JS and style sheets (CSS).
- JS: Handles dynamic components (e.g., user input, server communication).

The following example shows how to load DTM and play a single note when you open the web page.

1. Create a folder and a HTML file with any name, e.g., `test.html`.
2. Include `dtm.js` in the same folder. (You can download it [here](https://raw.githubusercontent.com/GTCMT/DataToMusicAPI/master/dtm.js).)
3. In the HTML file, write the following code:

```html
<html>
  <body>
    <script src="dtm.js"></script>
    <script>
      // Write your JS code here.
      dtm.music().play();
    </script>
  </body>
</html>
```

Notice that we wrote a JS code inside the HTML `<script></script>` tags, so everything is in one file. In most environments, you should be able to just open this HTML file in the browser and expect it to run. 

## 2. Hosting Data and Publishing a Website
Just as we included `dtm.js`, we can put other resources in the same folder as the HTML file or in sub folders. We might want to, for example, access some data in a CSV file and sonify it through DTM (JS code). However, HTML cannot load a CSV file directly, and JS cannot access resources that are not *loaded* onto a network. In order to use data sets in our web application, we need to load them using a server software. 

#### Web Services
- [BitBalloon](https://www.bitballoon.com/): For quick publishing of your web page on the Internet. 
- [etc.](https://designrope.com/toolbox/static-web-hosting/): Other free-ish web hosting solutions.

#### Local-hosting Programs
- (**Recommended**) Chrome [Web Server](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en): For quick local hosting of web page and data.
- Python 2 [SimpleHTTPServer](http://2ality.com/2014/06/simple-http-server.html): Mac and (most) Linux users can use this natively.
- (**Recommended**) NodeJS [HTTP Server](https://www.npmjs.com/package/http-server): You need to install NodeJS first.
- [MAMP](https://www.mamp.info/en/): A standalone server & database program.

#### OS-enabled Local Hosting
- Windows 8-10 [ISI Server](https://www.howtogeek.com/112455/how-to-install-iis-8-on-windows-8/): Local-hosting folder contents. You may need to install it as an additional Windows feature. (Windows installer not required.) 
- MacOS 10-12 [Apache](https://coolestguidesontheplanet.com/get-apache-mysql-php-phpmyadmin-working-osx-10-10-yosemite/): Local-hosting folder contents. You may need to activate it through Terminal.

If you try to load a resource in JS with just a file name, for example `'mydata.csv'`, JS might still no be able to find it even though the file is hosted. Instead of just a file name (or a relative path), you may need to add the base URL to create a full path, such that `path = window.location.href + 'mydata.csv'`.

Serving the resources by yourself is also important if you want to dynamically access them in JS. Otherwise, when you try to access a data source hosted on another website, you may encounter the **same-origin policy** (SOP) warning, a browser-enforced security feature. We can bypass this with, for example, browser [configuration](https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome) or [plugins](https://chrome.google.com/webstore/detail/jetbrains-ide-support/hmhgeddbohgjknpmjagkdomcpobmllji?hl=en), though you should be careful not to disable it all the time.

## 3. Live Coding and Interactive Editor
In this workshop, we will be mostly editing the JS code to build our sonification systems bit by bit. Using the HTML + JS, you might have to update the code and refresh the web page to see / hear a new result. (You could automate the page refreshing with a [file watcher](https://www.npmjs.com/package/watch).) JS is, however, an interpretive language, meaning you can execute new pieces of code to update the current program state in real time. You can do this by using the [developer console](http://debugbrowser.com/) in your browser. We can also use the [DTM interactive editor](http://dtmdemo.herokuapp.com/) for real-time editing and experiments. It offers some useful features such as local-file loading and real-time evaluation of code with the following shortcut keys:

Keys | Function
|-------|-------|
`CTRL/CMD + ENTER` | Evaluate all lines.
`SHIFT + ENTER` | Evaluate the statement at cursor or selection.
`CTRL + C` or `CTRL/CMD + .` | Stop DTM's playback.
`CTRL/CMD + E` | Toggle the auto evaluation on / off.
`SHIFT + CTRL/CMD + R` | Reload the page.

In this editor, we can also call these helper visualization functions:

```javascript
data.print(min, max) // Print the contents below the editor.
data.plot(min, max) // Plot the contents as a visual line graph.
// The min & max parameters are optional. If not present, the range is normalized.
```

To dynamically access data hosted on other web sites, again, you need to disable the SOP first. However, you can still use web data services (e.g., weather underground API) or download the data and open via the `FILE` button in the editor.


## 4. Learn Basic JavaScript in 5 Minutes
JavaScript is a deep and unique language that a few minutes is maybe not enough to properly understand it... DTM abstracts away much of the minor details of JS, so you can at least manipulate data and sounds with ease. However, it is still useful to know these basic concepts:

- Variables, objects, assignment
- Function calls, parameters, dot notation
- Function definitions, anonymous and callback functions

Variables are where you store primitive values (e.g., numbers) or complex data (called "objects").

```javascript
foo = 3.14; // Create a (global) variable and assign a new value.
bar = dtm.data(); // Create and store an object.
```

An object is structured data with unique values stored inside, as well as unique functions (methods) that you can call. Function calls are denoted with parenthesis `()` with sometimes parameters inside. 

```javascript
baz.dothis() // Some objects can call functions like this.
  .dothat(parameter) // Some functions can be "chained."
  .andthat(p1, p2, p3); // ; is the end of a statement.
```

Notice the `;` for terminating a statement only used in the third line. This indicates that the above three lines are a single statement. The use of `;` is optional in JS, but is recommended when writing a more complex code. In the [interactive editor](http://dtmdemo.herokuapp.com/), an explicit `;` separates the code into blocks for partial evaluation with `SHIFT + ENTER`. (It is an unconventional use of `;`, so please don't make it a habit!.)

The example above was calling some specific functions provided by the object named `baz`. In other words, you *cannot* call a function that does not exist in `baz`. Sometimes, or actually quite often in JS, you have to write your own function from scratch. It is so frequent that we usually don't even give it a name, and just call it an "anonymous function".

```javascript
// Defining a regular "named" function
function myFunction() {
  return "hello!"
}

// Defining an anonymous function
function (params) {
  return params; // Maybe do something with the parameters.
}

// ES6-style anonymous (arrow) function.
(params) => {
  return params;
}

// ES6-style functions can be very short sometimes!
input => output
```

Often, we write a new anonymous function and pass it as a parameter to the parent function. This type of function is called a callback function. 

```javascript
qux.callthis((value, index, parent) => {
  // Do something with the given parameters value, index, and parent.
});
```

Notice the parameters here look a little more distinct. While you have to name these parameters by yourself, the actual content of the parameters is defined by the parent function, and it changes dynamically depending on the current state of the parent. This leads to the concept of **functional programming**. Functional programming is a little more complex, so we will explain in the later section along with the `block`, `each`, and `map` functions of `dtm.data` and "nested" `dtm.music` for sequencing events.


## 5. Introduction to DTM: Design Principles
DTM aims to be a minimal programming interface with highly creative capabilities, specialized for a responsive or "live-coding" style development. The main components of DTM are `dtm.data` and `dtm.music` modules, and you would be primarily, if not only, using these two. 

The `dtm.data` is the universal format for handling data in DTM. It employs techniques of resampling and interpolation to enable a wide range of data-accessing methods, that you can "stretch" and "scan" values to read between data points. A `dtm.data` should be able to be passed to any parameter of other instances of `dtm.data` or `dtm.music` objects, regardless of the length or dimensionality. There are also sub modules `dtm.generator` and `dtm.loader`, though they return a regular `dtm.data` after filling the contents.

The `dtm.music` translates the incoming `dtm.data` into a real-time audio stream by automatically adjusting the time scale and iterating over data "blocks." By default, a `dtm.music` behaves as a simple monophonic synthesizer. However, it can be nested with other `dtm.music` for polyphonic expressions, trigger musical events or data processing at scheduled timings, read data points successively, and even continuously scan through data using a "phasor."

For the general language design, besides loosely keeping the JS language convention, DTM follows these principles; Objects allow function (method) chaining for successive transformations of itself; and functions use all-lower-case names for faster typing (e.g., `data.powof(2)`).


## 6. Handling Data with `dtm.data`
This section introduces some of the most important operations used in `dtm.data`. 

### Creating a Data Object
First, let's see how we can create a data object by manually filling values.

```javascript
a = dtm.data(); // Creates an empty data object.
a.set(1, 2, 3); // Set the content.
a.set([2, 3, 4]); // This also does the same thing, overwriting the above.
a = dtm.data(4, 5, 6); // Create with initial values. 
```
`dtm.data(params)` creates a new data object using so-called factory method. Notice that the line 4 overwrites the variable `a` by creating and assigning (`=`) a new data object, which is different from the `set()` in line 2-3. Now the variable `a` in line 4 actually contains a different object inside than line 1-3!


### Generating Data
Sometimes we want to automate creating a list of values with common generative algorithms or patterns. Here are some simple but useful generators in DTM.

```javascript
dtm.line(length, min, max); // Generates a straight line. The default range is 0-1.
dtm.range(start, stop); // Creates an incremental series of integers.
dtm.scale(name); // Creates a common musical scale, such as Ionian, etc.
dtm.sine(size); // Generates a sine wave ranging between -1 to 1.
dtm.random(size, min, max); // Generates uniform-random fractional values.
dtm.randi(size, min, max+1); // Generates random integer values.
```

The `dtm.gen` family returns a `dtm.data` object, so you can process them further with the regular `dtm.data` functions.


### Loading External Data File
In data sonification, we are often more interested in using existing real-world data than generated data. The `dtm.loader` is equipped with various ways to load or stream data, including CSV, JSON, text, image, audio files, web services (REST calls), as well as the stream of data from camera and microphone on your computer. As explained before in [Section 2](#2.-hosting-data-and-publishing-a-website), in many cases, you need to host the data file in your server and access its URL like this:

```javascript
url = window.location.href + 'data.csv';
dtm.csv(url, data => data.print());
```
For convenience, the [online editor](http://dtmdemo.herokuapp.com/) provides the `FILE` button for loading local files. This will load the file into a data object, a global variable, named as `file`.

```javascript
file.print(); // After loading a local file, such as a CSV file, check the content of the "file" object.
file().keys().print(); // List the column names of the CSV.
a = file('foo'); // This will return the column named "foo."
b = file(0); // The will return the first column, regardless of its name.
```

With the `FILE` button, any file is automatically loaded into a `dtm.data` object **except for image data**. Since there are several ways to preprocess image data, an image file will be first loaded as a data URL into the `file` variable, and you will need to pass it to the `dtm.image` loader.

```javascript
// Load an image file with [FILE] button first. Then...
dtm.image(file, (data) => {
  data(0).plot(); // Plot the first ROW of the image (not column).
}, 'heatmap');
```

The third parameter is the preprocessing mode. Currently, there are only two modes available -- `'brightness'` (default) and `'heatmap'`.


### Accessing Data (Basic)
In regular JS, when you want to read values from an array-like data, you would use the square-bracket notation (i.e., `array[n]`). Unfortunately, DTM does not offer this method, and you are asked to use parenthesis just as calling functions (e.g., `data(n)`). However, despite the potential confusion with this syntax, DTM provides *numerous* ways of reading values from a data object, not just index by index. One way is by treating indices as data and manipulating them. We can, for instance, use the range generator to access a portion of data, and more.

```javascript
r = dtm.range(10, 20); // Generates index values [10, 11, ..., 19].
a = data(r); // Returns (copies of) the values at the indices "r."

r.add(10); // Modify the range to [20 ... 29].
b = data(r);

r.rev(); // Reverse the direction of the indices.
c = data(r);
```
As you see in the third example with `c`, we can have the index data in a descending order. What happens if we use a sine generator as indices? 

```javascript
// Create a 100-point sine curve with the range.
r = dtm.sine(100).range(-30, 30);
a = data(r);
```

When the index value is fractional, it is automatically rounded to get the nearest data point. We can also estimate the values between data points using fractional indices, and we will be introducing how to this in a [later section](#accessing-data-advanced).


### Transforming and Analyzing Data
A `dtm.data` object is equipped with tons of list-processing functions -- some are common and basic, but some are quite unusual and weird (but perhaps musically useful). We only list a limited potion here. For the complete list, please see the [API documentation](http://dtmdemo.herokuapp.com/doc). 

First, here are some scaling and arithmetic operations.

```javascript
// Rescales each values to a new range. 
// The optional dmin and dmax are the domain extent.
data.range(min, max, dmin, dmax);

// Apply a logarithmic or exponential scaling.
// A positive value gives a logarithmic, and a negative value gives an exponential curve.
data.curve(factor);

data.add(factor);
data.mult(factor); // Multiply.
data.recip(numerator); // Reciprocal (e.g., 1/val) of the data.
data.power(exponent);
data.powof(base); // Treat data as exponents.

data.abs(); // Absolute values.
data.round(interval); // Rounds to an interval (default 1).
data.mod(divisor);

data.mtof(); // MIDI note to frequency conversion.
data.ftom(); // Frequency to MIDI note number.
data.freqtomel(); // Frequency to the Mel scale.
data.meltofreq(); // Frequency to the Mel scale.

data.diff(order); // Take the difference.
data.sum(); // Sum across the data points.
```

These operations apply changes to the source data itself, and you would typically chain them to create a complex transformation (e.g., `data.op1().op2().op3(), etc.`).

Here are some of the analytical and DSP functions available. 

```javascript
data.keys(); // List the column names of the single- / 2-D data.
data.len(); // Show the length of the 1-D data. 
data.unique(); // Reduce the values to a list of unique values.

data.mean(); // Show the average value.
data.var(); // Show the variance.
data.std(); // Standard deviation.
data.pstd(); // Population standard deviation.
data.mode();
data.median();
data.midrange();
data.centroid();
data.rms(); // Root-mean-square value.

data.corr(target, normalize); // Correlation or autocorrelation.
data.cov(target, normalize); // Covariance.
data.amdf(max); // Average magnitude difference function.

data.histo(); // Histogram (counts), shown in 2-D key-value structure.
data.dist(); // Gives the distribution (0-1) of symbols.
data.cdf(); // Cumulative distribution function (CDF).
data.icdf(); // Inverted CDF. Useful for random sampling.
data.entropy(); // Measure "randomness" of the data.

data.dct(); // DCT (Type II).
data.idct(); // Inverse DCT.
data.fft(); // FFT analysis (Currently only gives the magnitude spectrum of the signal.)
data.fir(coef); // Apply an FIR filter.
```

Many of these analytical functions overwrites the existing content with a summarized data. If you want to keep the original data for later use, you would need to clone the source object. Please read the following section [Cloning](#cloning). 


### Interpolation and Morphing
Pherhaps the most useful features in `dtm.data`, you can stretch or shrink one-dimensional data into any length regardless of the original size. There are two ways to do this, the `stretch` method with a stretch factor and the `fit` method with the target length. They can use one of four interpolation methods -- `linear` (default), `step`, `cosine`, and `cubic` interpolation. 

```javascript
// Fit method takes a target length(s) and mode parameters.
data.fit(100); // Linear interpolation into the length of 100.
data.fit(100, 'step'); // Step interpolation.
data.fit(100, 'cos'); // Cosine interpolation. etc...

// These are shorthands for the fit methods.
data.linear(n); // Also data.line(n) works.
data.step(n);
data.cosine(n); // Also data.cos(n).
data.cubic(n); // Also data.cub(n).

// Stretch can take fractional values as factor.
data.stretch(factor, mode);

// These are the shorthands for the stretch methods.
data.slinear(n);
data.sstep(n);
data.scosine(n);
data.scubic(n);
```

By using the shorthand names, or using an array or data object as fit/stretch factors, we can do a multi-segment interpolation. This yields a very interesting and nonlinear result, useful for creating musical envelopes and patterns. The following shows how to create a typical "ADSR" envelope used in musical modulations.

```javascript
// Creating an ADSR envelope.
a = dtm.data(0,1,0.5,0.4,0) // Levels: initial, attack peak, sustain 1, sustain 2, end
  .line(20,50,200,100); // Time (relative): attack, decay, sustain, release

dtm.music().play().for(2).amp(a); // The envelope is further time-scaled by the music object.
```

#### Accessing Data (Advanced)
As explained before, when we access data with the basic method (e.g., `data(index)`), if the index value is fractional, it is automatically rounded to get the nearest value / column. The `interp` and `phase` functions provide a way to read (guess) the values between the existing data points.

```javascript
a = dtm.data(1, 2, 10);

// Read the data at a fractional index value.
a().interp(0.5); // Gives 1.5
a().interp(1.5); // Gives 6

// Read the data at a relative phase value (between 0-1, or beyond).
a().phase(0.5); // Gives 2
a().phase(0.25, 0.75); // Gives [1.5, 6]

// Read the data using a phasor function.
p = dtm.line(100); // Creates a 100-points line between 0-1.
p.curve(10); // Apply some logarithmic scaling.
a().phase(p); // Interpolate through the data points.
```

#### Pseudo-musical Modulation
The resampling techniques in DTM enable some unconventional list transformations such as frequency modulation (FM) and amplitude modulation (AM). This lets data to transform quite dynamically and generate interesting patterns. Watch out though, these operations are bound to the number of samples in the data, so you may need to resample (interpolate) into a sufficient length first. Otherwise, you may get a low-resolution "strobe" effect.

```javascript
a = dtm.data(0, -1, 1, 0)
  .sstep(100) // Stretch to 100 times longer with step interpolation.
  .freq(10, 30, -20) // You can have multiple points (segments) with different frequency.
```

### Cloning Data Object
This is where it gets a little confusing and tricky. Section ... described that calling the data object itself as function (i.e., `data(index)`) was used to get some value(s) or column(s) of the data object at the index. Actually, this is creating a copy(s) of the data contents rather than returning the reference to the original data points. When we call the data object without passing any index values, like `data()`, it returns a copy of the entire data object. This is quite useful and essential for controlling the state of a complex sonification system, where you may have a data source mapped to multiple parameters with different transformations applied to them. By cloning a data object, any further changes in the original data would *not* reflect on the newly cloned object.

```javascript
a = dtm.data(1, 2, 3); // Create a new object, as usual.
b = a.fit(10); // This variable "b" simply points to the variable "a," the same object. Not very useful, actually.
c = a(); // Create a copy of "a" and assign to a new variable.
a.range(-1, 1); // This would change the contents of the variables "a" and "b," but not "c."
```


### Functional Operations and Blocking Data
Another useful, but perhaps a little advanced, technique is called functional programming. It is used a lot in regular JS programming, where you would be actively defining small custom functions as part of the chain of processing. In DTM, we have the `each` and `map` functions to do functional list operations. The key difference between them is that you have to return some new values in the `map` function, overwriting the exiting values, while `each` only processes some function but do not require (or does nothing) with the returned values.

```javascript
// Modify each data point.
data.each(d => d.add(10));

// Create ramps [1,...,0] of varying decay length.
data.map(d => {
  return dtm.data(1, 0).stretch(d);
});
```

Note that `each` and `map` functions pass each data point as `dtm.data` in the argument, so you can use the `dtm.data` functions directly on them. If you want to use the raw values instead, `eachv` and `mapv` functions should be used.

```javascript
// Create ramps with a fixed length (100), starting from varying value.
data.mapv(v => {
  return dtm.data(v, 0).line(100);
});
```

While `each` and `map` are useful for 1-D vector data, it becomes quite essential for multi-dimensional matrix, or what we call "blocked" data in DTM. First, let's see how to create blocks from a 1-D data.

```javascript
data.block(20); // Slice the data at every 20 data points (no overlaps).
data.block(10, 5); // Slice by 10 points, but shift the starting point by 5 (with overlaps).

data.block.into(10); // Slice into 10 blocks, automatically calculating the length.

data.unblock(); // Concatenate the blocks into a 1-D vector.
data.ola(5); // Overlap-and-add blocks into a 1-D vector with the shifting factor of 5.
```

There are also other methods of creating blocks, such as by copying columns, with if-conditionals, and slicing at local peaks that would result in varying-length blocks. 

The use of multi-dimensional blocks are essential in DTM for expanding simple series of values into more complex patterns, summarizing a large data, and block-wise transformations such as STFT. It is also used in `dtm.music` for sequencing musical events at various speeds and timings.

```javascript
// Summarize every 10 samples into an average value.
data.block(10)
  .map(d => d.mean())
  .unblock(); // Put the blocks back to one-dimensional representation.
```

### Extending the dtm.data Functions
If you cannot find a transform function you need in DTM, or if you don't like the way some functions behave, there is a way to fix it! You can customize the `dtm.data` on the fly, adding new functions or overwriting existing ones. Here is how:

```javascript
// Adding a custom function that converts magnitude (0-1) values to dBFS (-INF-0) values.
dtm.data.augment({
  aliases: {
  	magtodb: ['mag2db', 'm2db'] // (Optional) additional names for the function.
  },
  magtodb: function () {
    // "this" signifies the data object itself.
    return this.map(function (d) {
    	// Map function provides each data point as a dtm.data object.
      return d.log(10).mult(20);
    });
  }
});

a = dtm.data(0.5, 1.0, 0.9, 0.01)
  .magtodb() // You can use the new function in all data object.
  .print(); // -> [-6.0206, 0, -0.91515, -40]
```

Note that the `augment` function is called directly from the `dtm.data` module (i.e., `dtm.data.augment()`), without parenthesis. This would allow any newly created data objects to use the added function.


## 7. Sonifying Data with `dtm.music`
With `dtm.data`, transformation processes happen almost immediately. (Though it can get slow if you are dealing with a huge data at once.) In contrast, `dtm.music` operates in real time and translates the values of a data object to an audio stream. Additionally, the music object can be used for such as sequencing musical events, reading data points in a non-linear order in real time, or even continuously scanning through data that can create a "morphing" effect.

One important behavior of `dtm.music` is that it automatically time-scales the input data to fit into the specified duration (1 second if unspecified). You can play for a longer duration to hear the local fluctuations of data, or play for a fraction of second to hear the data as a small "grain".


### Creating a Music Object
Similar to `dtm.data`, we need to first create an instance of music object.

```javascript
mus = dtm.music(); // Creates a new music object.
mus.play(); // Play the default sine tone at A4 (440Hz) for 1 second.
```

After starting, the `dtm.music` object automatically stops after certain duration (default is for 1 second). To change the duration, we can use the `for` function. 

```javascript
mus.play().for(0.3); // Play a tone for 0.3 second.
mus.for(0.3).play(); // In dtm.music, the order of method calls generally does not matter.
```

In case you need to halt the sound immediately while it is playing, you can call the `stop` function.

```javascript
mus.stop(); // Stop the music object.
dtm.stop(); // Stops every notes currently being played.
```

The `stop` function is, unfortunately, currently broken in Safari (Jun 20, 2017).

Just as the `dtm.data` object, you can clone a music object by calling itself as a function. This copies all the parametric modulations into a new object (which is explained in the following sections.)

```javascript
a = dtm.music().wave(data).note(60).delay(0.3);
b = a().note(72).play(); // Duplicate the music object and play in a different pitch.
```

### Simple Parameter Mapping
The `dtm.music` object offers a few (not many compared to `dtm.data`), synthesis parameters that you can modulate with data. Despite the limited number of parameters, the data you supply to them may create a really dynamic effect.

```javascript
mus = dtm.music().play();

mus.note(72) // Modulate the pitch by a note number.
  .freq(880, 660) // Or, modulate the pitch by a frequency(s).
  .amp(data.range(0, 1)) // Modulate the amplitude. Values should be scaled to 0-1 (or smaller).
  .pan(0); // Modulate the stereo panning. Values should be between -1 (left) to 1 (right).
```

The parameters can take raw numbers or a `dtm.data`, which could contain *any* size of numerical values. You might want to watch out for the ranges though, and you would typically map the data in combination with the `range(min, max)` function.

The default timbre of `dtm.music` is a sine wave. We can modify the waveform by simply mapping data to it (with the range between -1 to 1).

```javascript
// Creating simple waveforms.
a = dtm.data(-1, 1); // A square wave.
b = dtm.data(-1, 1).linear(1000); // A 1000-point sawtooth wave.
c = dtm.sine().round(0.25); // An 8-bit sine wave.

dtm.music().wave(a).play(); // Set the waveform and play.

// A simple noise as waveform.
d = dtm.random(44100).range(-1, 1); // A one-second white noise.
dtm.music().wave(d).freq(1).play(); // Play the noise at the "original" frequency multiplier.

// Using an audio sample. (The file needs to be served!)
e = dtm.music().sample('mysample.wav');
e.pitch(1.5).play(); // Samples are pitch-shifted using this method (default = 1).
```

Lastly, data can automate audio effects in `dtm.music`. Unlike the previous synthesis parameters, the audio effects usually have multiple unique parameters that each requires a value or data object. However, you can chain and add as many audio effects as you want (until your browser crashes).

```javascript
mus = dtm.music().play();

// Basic biquad filters.
mus.lpf(freq, reson) // Low-pass filter
mus.hpf(freq, reson) // High-pass filter
mus.bpf(freq, reson) // Band-pass filter
mus.apf(freq, reson) // All-pass filter

// Delay-line effect.
// mix: Wet-dry mix: 1 = 100% wet, 0 = 0% wet.
// time: Delay time in seconds.
// feedback: Feed back ratio in 0 - 1.
mus.delay(mix, time, feedback);

mus.reverb(mix); // A simple convolution reverb.
mus.convolve(tgtData, mix); // Filter / morph with another data in real time.

mus.bitquantize(bit); // Bit quantization on the waveform.
mus.samphold(samples); // Sample-hold on the waveform.
```

### Sonification Technique 1: Audification
Although DTM is not particularly designed for creating effective "audifications" (i.e., a sonification technique to map each data points to audio samples with some scaling and editing of data as necessary), we can certainly do that using the waveform parameter. Only that we want to watch out for the data size to not exceed the memory limit of the browser, and some blocking operation may be needed to reduce the real-time work load.

```javascript
data.range(-1, 1).fit(44100 * 10) // Create a 10 second waveform from data.

// Since we are not "repeating" the waveform like an oscillator, we play it back at the original frequency multiplier = 1. (The sampling frequency is 44.1kHz.)
dtm.music().wave(data).freq(1)
  .play().for(10); // Play for 10 seconds.
```

### Sequencing with Repetition
In DTM, we call a single note of `dtm.music` a "musical event." The event might contain just a single pitch, a complex and long motions like an audification, or a scheduled processing of data objects. We can construct a series of such musical events using the `rep` (repeat) as well as `seq` (sequence) function. First, let's look at how `rep` works.

```javascript
mus.play().rep(); // Repeat the note forever at 1-second cycle.
mus.play().rep(3); // Repeat only 3 times.

mus.play().rep().at(1.5); // Repeat every 1.5 second.
mus.play().for(0.5).rep().at(1.5); // Play for 0.5 second (duration) every 1.5 second (onset interval).

mus.play().for(data).rep().at(data); // Of course, the rhythm can be varied using (1-D) data.
```

Note that if you map a 1-D data to a parameter of a music object, such as the pitch, it would repeat the same sequence over and over at the specified interval and duration. What if you want to playback only one or several values within the data at a time, triggered at the specified intervals? This is where the concept of "blocked data" comes into play. 

```javascript
a = dtm.data(0, 2, 4).add(72); // A simple note sequence [C, D, E]
mus.play().rep().note(a); // Plays the sequence quickly in one-shot, repeatedly.

b = a.block(1); // Slice and put each note value into a block.
mus.play().rep().note(b); // Now, each note is played for 1 second, iteratively.

c = dtm.data(1, 2, 2, 0, 1); // Create a nonlinear block sequence.
mus.note(b).play().rep().seq(c); // The order of block playback is now nonlinear!
```

As the above example shows, each block (containing 1-D vector) is assigned to a "musical event" and are iterated automatically, either incrementally (default) or following the sequenced indices (`seq()`).


### Sonification Technique 2: Granular Synthesis
Musical events can be a series of *very* short single-pitched notes, with randomized timing. This approach creates a synthesis technique called the "granular" effect.

```javascript
D = dtm.data
T = dtm.to
M = dtm.music

// Generate uniform random data.
a = dtm.random(10000);

// Generate an attack-decay envelope.
b = dtm.data(0,0.2,0).line(10,1000).plot();

dtm.music().play()
  .for(0.2).rep() // Very short note (grain).
  .at(dtm.random(a.length, 0.03)) // Random timing intervals.
  .note(a().range(60,90).block(1)) // Iterate through notes.
  .amp(b) // Every note uses this amplitude envelope.
```

### Scheduling Events and Nesting
The music object is not only a monophonic synthesis "voice," but also an event scheduler for audio and data processing. You could think of it as a clock. In addition to this, a music object can contain other music objects inside (as part of the callback function), allowing harmonic and polyphonic expressions.

```javascript
mus = dtm.music((m, i) => {
	// The argument m is the parent music object,
	// and i is the current sequence value.
  a = data(i).print();
  dtm.music().note(a).for(0.3).play();
  dtm.music().note(a().add(4)).for(0.3).play();
}); 

// The above nested-music object won't do anything without explicitly playing or triggering.
// The "trigger" function starts the music object, but will play silently.
mus.trigger(); // Trigger once.
mus.trigger().rep().at(0.5) // Trigger repeatedly and iterate.
```

### Scanning Data with dtm.music
Lastly, the music object is also capable of a very fast and continuous reading of data using its `phase` callback function. It provides an argument (a `dtm.data` object) containing the current phase (starting from 0 and ending at 1) of the musical event, which can be used in combination with the `data.phase()`. However, as `data.phase()` overwrites the content of the data with the value at the current phase, you may want to clone the data first before reading by the phasor. 

```javascript
dtm.music()
  .trigger() // Start the music object without sound.
  .for(3) // Set the duration to 3 seconds.
  .phase(p => {
    data().phase(p).print();
  });
```

The phase curve in `dtm.music` can be modified with the `curve` function, allowing a continuous non-linear motion.

```javascript
a = dtm.data(10, 20); // Create a range (extent) of frequency values.
b = dtm.data(0, 1, 0.5, -0.5, 0); // Create a nonlinear phase function.

mus.trigger().for(5)
  .phase(p => {
    // A sine wave with frequency modulation. 
    dtm.sin().freq(a().mphase(p)) // A "mirrored" phase function.
      .plot();
  })
  .curve(b); // Set the nonlinear phase motion.
```
