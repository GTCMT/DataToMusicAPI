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


The dtm.array is the main unit for dealing with data in DTM, including storing, transforming, analyzing, and passing itself to other modules. Here, we cover the basic operations of the dtm.array.

# Basics

Creating an array and assigning values

    var arr = dtm.array([0, 1, 2])
    arr.set([3, 4, 5])
    arr.set(['hello', 'world'])

Note that when every value is of the number type, the content is automatically casted to the Float32Array type. In general, you should avoid mixing different value types (e.g., strings, numbers, and booleans)

Retrieving values

    var arr = dtm.array([0, 1, 2])
    arr.get() // -> [0, 1, 2]
    arr.val // -> [0, 1, 2]: This is a shorthand for for .get()
    arr.get(0) // -> 0
    arr.get(-1) // -> 2
    arr.get([0, 2]) // -> 0, 2


Retrieving the basic statistics

    var arr = dtm.array([0, 1, 2, 3, 4])
    arr.get('len') // -> 5
    arr.len // -> 5: This is a shorthand for .get('len')
    arr.get('mean') // -> 2
    arr.get('sum') // -> 10
    arr.get('type') // -> 'string'
    arr.get('min') // -> 0
    arr.get('max') // -> 4
    

Retrieving values as new arrays
    
    var arr = dtm.array([0, 1, 2])
    arr.col([0, 2]) // -> dtm.array([0, 2])


# The dtm.array sub-types
When we load data, they are stored in a dtm.array in multi-column structure. In other words, it creates a dtm.array containing multiple dtm.arrays as its elements.

    dtm.load('filepath').then(function (data) {
        data // this is a dtm.array with the value of multiple dtm.arrays
    })
    
The dtm.generator is also returns a dtm.array.

    waveform = dtm.gen('sine')
    waveform.range(0, 10).clip(3, 6).fit(100).repeat(3)


## Storing and cloning 
Cloning is very useful if you want to transform a single source into multiple output. Without cloning, transformation methods will always change the array itself, and you may not be able to reuse certain states. 

    var arr = dtm.array([0, 1, 2])
    var copy = arr.clone()
    
    copy.add(1).val // -> [1, 2, 3]
    arr.val // -> [0, 1, 2]


Shorthand: you can clone an array by calling the dtm.array variable as a function

    var copy = arr()

So you can do

    var arr = dtm.array([0, 1, 2])
    arr().add(1).val // -> [1, 2, 3]
    arr.val // -> [0, 1, 2]

Recall the original when the array was first created. This is useful if you want to get the raw data, etc.

    arr.reset()
    arr.original() // Alias


# Basic musical transformations
Intervals to beats

    var clave = dtm.a([3,3,2+2,2,4]).itob()


# Some musical examples
Creating a sequence of decaying envelope

	// The typical clave rhythm sequence, with varying volume
	var clave = [1,0,0,0.5, 0,0,1,0, 0,0,0.5,0, 1,0,0,0];

	var env = dtm.array(clave) // Wrap the native array
		.block(1) // This creates a nested array, looking like [[1],[0],[0],[0.5], etc.]
		.map(function (v) {
			return dtm.gen('decay').mult(v); // For each blocked value v, generate a decaying envelope
		})
		.unnest(); // Reduce the blocked-arrays back to a single-dimensional array

	dtm.synth().play()
		.amp(env)
		.dur(clave.length * 0.1); // Each note to be 0.1 second

<button onclick="playPrev(this)">Listen</button>

Time-stretching audio

    dtm.synth('sample.wav').play()
        .wt(function (a) {
            var hopSize = 512;
            var stretchFactor = 2;
            return a.block(1024, hopSize, 'hamm').ola(hopSize * stretchFactor);
        });

<button onclick="playPrev(this)">Listen</button>

Generating harmonics for the wavetable

    a = dtm.a([1,0,1,0,0.5,0.3,0.7,1]); // magnitude of each harmonic partial
    a.map(function (v, i) {
        return dtm.gen('sine').size(1024).freq(i+1).mult(v);
    }).sum();
    
    dtm.synth().wt(a).amp(0.3).play()

<button onclick="playPrev(this)">Listen</button>

# Modeling array transformations

