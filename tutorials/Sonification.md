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

# Basic mapping techniques

Mapping a vector to the pitch of monophonic sine tone

    var a = dtm.array([22, 56, 30, 1, 2, 6, 90, 33]);
    a.range([60, 100]) // Rescale the values to typical MIDI note range
    
    dtm.synth().play()
        .nn(a) // nn is an aliase for the "notenum" in MIDI
        .dur(1) // Total duration in seconds

<button onclick="playPrev(this)">Listen</button>


Similar mapping, but with a specific interval for each data point rather than fitting the sequence to the total duration

    var a = dtm.array([22, 56, 30, 1, 2, 6, 90, 33]);
    var itv = 0.3; // Interval in second
    
    dtm.synth().play()
        .nn(a.range([60, 100]))
        .dur(a.get('len') * itv) // Total array length scaled by the interval

<button onclick="playPrev(this)">Listen</button>

    var data = dtm.a([8.169702529907227, 6.087637901306152, 1.356462836265564, 9.57699203491211, 1.8769015073776245, 4.273120403289795, 1.8355945348739624, 8.406926155090332])
    
    data.range([1,20], [0,10]) // Rescale to an output range, with the domain range specified
        .round(); // Round the values
    
    dtm.clock(function () {
        ramps = dtm.gen('decay')
            .rep(data.get('next')) // Iterate through the 
            
        dtm.syn().play()
            .nn(72)
            .amp(ramps)
    }).time(1/4).bpm(60)
        
<button onclick="playPrev(this)">Listen</button>

# Data "audification"

Audification is a rather streight-forward technique that scales the amplitude and time scale to audio-sample level: In other words, a vector casted to a long duration waveform.

    wf = dtm.gen('random')
    	.size(s.get('numsamps'))
    	.range(-1,1)

    s.wt(wf).amp([0,1,1,0])
    	.amp(function(a) {
    		return a.fit(100)
    	})

<button onclick="playPrev(this)">Listen</button>
