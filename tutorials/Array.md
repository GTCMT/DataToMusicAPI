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



# Basics
Creating an array and assigning values

    var arr = dtm.array([0, 1, 2])
    arr.set([3, 4, 5])
    arr.set(['hello', 'world'])

Note that when every value is of the number type, the content is automatically casted to Float32Array


Retrieving values

    var arr = dtm.array([0, 1, 2])
    arr.get() // -> [0, 1, 2]
    arr.value // -> [0, 1, 2]
    arr.get(0) // -> 0
    arr.get(-1) // -> 2
    arr.get([0, 2]) // -> 0, 2


Retrieving the basic statistics

    var arr = dtm.array([0, 1, 2, 3, 4])
    arr.get('len') // -> 5
    arr.get('mean') // -> 2
    arr.get('sum') // -> 10
    arr.get('type') // -> 'string'
    arr.get('min') // -> 0
    arr.get('max') // -> 4
    

Retrieving values as new arrays
    
    var arr = dtm.array([0, 1, 2])
    arr.col([0, 2]) // -> dtm.array([0, 2])


# The dtm.array sub-types

    dtm.load('filepath').then(function (data) {
        data // this is a dtm.array with the value of multiple dtm.arrays
    })
    
    // dtm.generator is also a dtm.array type
    wavetable = dtm.gen('sine')
    wavetable.range(0, 10).clip(3, 6).fit(100).repeat(3)


## Storing and cloning 
Cloning is very useful if you want to transform a single source into multiple output.

    arr = dtm.array([0, 1, 2])
    copy = arr.clone().add(1)
    
    arr.value // -> [0, 1, 2]
    copy.value // -> [1, 2, 3]


    // Shorthand: you can clone an array by calling the dtm.array variable as a function
    copy = arr()
    
    arr = dtm.array([0, 1, 2])
    arr().add(1).value // -> [1, 2, 3]
    arr.value // -> [0, 1, 2]
    


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

