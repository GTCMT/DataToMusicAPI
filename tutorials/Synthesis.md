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

# The basic techniques for dtm.synth

## Making sound

Play a sine tone for one second with the default frequency (A=440)

    dtm.synth().play()

<button onclick="playPrev(this)">Listen</button>

-------------------------------

Also, these are the shorthands for creating a dtm.synth.

    dtm.syn().play()
    
<button onclick="playPrev(this)">Listen</button>

-------------------------------

    dtm.s().play()

<button onclick="playPrev(this)">Listen</button>

## Changing the pitch
Play a note with the pitch changed, with the MIDI note number parameter modified

    dtm.syn().notenum(60).play()

<button onclick="playPrev(this)">Listen</button>

-------------------------------

The shorthand for notenum() is nn(). Also, you can see that the order of play() and nn() does not matter.

    dtm.syn().play().nn(60)

<button onclick="playPrev(this)">Listen</button>

-------------------------------

Play a note at a specified frequency

    dtm.syn().freq(1000).play()

<button onclick="playPrev(this)">Listen</button>

-------------------------------

Play multiple notes using an array of MIDI note numbers. -- Notice that each "note" is played rather quickly while the total duration stays the same (1 second). With dtm.synth, an array assigned to a parameter is treated like an "automation curve" rather than a "sequence."

	dtm.syn().nn([60,62,64]).play()

<button onclick="playPrev(this)">Listen</button>

-------------------------------

	dtm.syn().nn([60,64,67,71,72,76,79,83,84,83,79,76,72,71,67,64]).play()

<button onclick="playPrev(this)">Listen</button>

## Parameter modulation patterns
Additive modulation -- the notation is .param.add()

	dtm.syn().play()
	    .nn(72) // Setting the base value and modulation
		.nn.add([0,4,7]) // MIDI notenum differences, typically corresponds to "do, mi, sol"

<button onclick="playPrev(this)">Listen</button>

-------------------------------

The parameter-modulation supports add, mult, pow, powof, as well as with callback function.

Modifying the existing parameter with a callback function

	dtm.syn().freq([440, 480, 520]).play()
		.freq(function (param) {
			return param.mult(2) // -> freq: [880, 960, 1040]
		})

<button onclick="playPrev(this)">Listen</button>


## Timing, basic sequencing
Play a note for 0.1 second

	dtm.syn().play().dur(0.1)

<button onclick="playPrev(this)">Listen</button>

-------------------------------

Play a note after a short delay

	dtm.syn().play().offset(0.5)

<button onclick="playPrev(this)">Listen</button>

-------------------------------

Repeat the note after it is finished

	// Play 5 times
	dtm.syn().play().rep(5)

<button onclick="playPrev(this)">Listen</button>

-------------------------------

	// Repeat infinite times
	var s = dtm.syn().play().rep(Infinity)
	s.stop() // Don't forget to stop at some point

<button onclick="playPrev(this)">Listen</button>

-------------------------------

The play call accepts boolean or {0, 1} for overriding.
	
	dtm.syn().play(false) // Will not play

<button onclick="playPrev(this)">Listen</button>


Sequencing with array input



## Storing, reusing, cloning
Rather than chaining the commands from the beginning to the end, you can save the current state into a variable, and call it later.

	var s = dtm.syn().dur(0.1)
	s.offset(0.5).play()

<button onclick="playPrev(this)">Listen</button>


It can, however, often become problematic reusing the same object in multiple places, as operations from different places may overwrite the variable's single state. For example, you cannot really do this:

	var s = dtm.syn().dur(0.1) // Duration = 0.1 as the base setting
	s.nn(60).offset(0).play() // Play a C note immediately
	s.nn(67).offset(0.5).play() // Play a G note after 0.5 second delay

<button onclick="playPrev(this)">Listen</button>


For such cases, similar to dtm.array, you may want to clone the object before setting new values.

	var s = dtm.syn().dur(0.1)
	s.clone().nn(60).offset(0).play()
	s.clone().nn(67).offset(0.5).play()

<button onclick="playPrev(this)">Listen</button>

	// Shorthand: call the synth object as function to clone
	var s = dtm.syn().dur(0.1)
	s().nn(60).offset(0).play()
	s().nn(67).offset(0.5).play()

<button onclick="playPrev(this)">Listen</button>


## Other common parameters
The dtm.synth has several stationary parameters as well as dynamically generated parameters. The stationary parameters include the following: amp, notenum (nn), freq, pitch, pan, wavetable (wt), dur, offset, and play. 


Amplitude envelope

	// Using dtm.generator -- This creates a dtm.array with the values of decaying ramp going from 1 to 0.
	env = dtm.gen('decay')
	dtm.syn().amp(env).play()

<button onclick="playPrev(this)">Listen</button>


Basic wavetable modulation

	dtm.syn().wavetable([-1,1]).play() // Plays a square wave

<button onclick="playPrev(this)">Listen</button>

	// Shorthand for wavetable() is wt()
	dtm.syn().play().wt([-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]) // Stepped saw-like waveform

<button onclick="playPrev(this)">Listen</button>

	// Using dtm.generator, create and play a noise wavetable
	var noise = dtm.gen('random').size(8192).range(-1, 1)
	s = dtm.syn().play().wt(noise).pitch(1)

<button onclick="playPrev(this)">Listen</button>


Using audio samples. Note that the sample file have to be served in the same web application space, or uploaded by the user via HTML DOM <input>, otherwise you may encounter the SOP problem with your browser.
	
	dtm.syn().load('sample.wav').play()

<button onclick="playPrev(this)">Listen</button>

Shorthand: as an argument in dtm.synth() instantiation

	dtm.syn('sample.wav').play()

<button onclick="playPrev(this)">Listen</button>

Modifying the pitch -- Notice that we typically don't use notenum or freq with audio samples. The pitch parameter corresponds to the playback rate, with the default value of 1. You can double or halve the value to play in an octave above or below, respectively.

	dtm.syn('sample.wav').pitch(2).play()

<button onclick="playPrev(this)">Listen</button>

The dynamically generated parameters are typically audio effects, such as the following: gain, lpf, hpf, bpf, apf, delay, reverb (verb), bitquantize (bq), and samplehold (sh). These parameters are newly added to the effect chain as called, and can be stuck multiple times. It is, therefore, not possible to set the base value and modulate it with additional chained function calls, and we have to explicitly add a "name" to the parameters to modulate, modify with functional callback, or change the state in real time while already in playback. The details are discussed later.


## Using dtm.array with dtm.synth
Although you can use the default number or array types in JavaScript in dtm.synth, the dtm.array is the basic unit for many operations in dtm.synth, allowing dynamic transformations.

    var saw = dtm.gen('saw');
    dtm.syn().wt(saw).play();

<button onclick="playPrev(this)">Listen</button>


## Generators
Here, we explain the general use case of the dtm.generator, which is a subtype of dtm.array, in combination with the dtm.synth.

    var env = dtm.gen('decay')
    dtm.syn().amp(env).play()


## Applying effects
    
    dtm.syn().play()
        .wt(dtm.gen('saw'))
        .lpf(2000)

<button onclick="playPrev(this)">Listen</button>





## Named parameters, real-time (non-prescheduled) parameter modifcation




## Blocked sequencing

    a = dtm.array([0, 4], [2, 5], [4, 7])
    
    dtm.syn().play()
        .nn(60)
        .nn.add(a)

<button onclick="playPrev(this)">Listen</button>















