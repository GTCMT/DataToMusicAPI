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



Mapping a vector to the pitch of monophonic sine tone

    var a = dtm.array([22, 56, 30, 1, 2, 6, 90, 33]);
    a.range([60, 100]) // Rescale the values to typical MIDI note range
    
    dtm.synth().play()
        .nn(a) // nn is an aliase for the "notenum" in MIDI
        .dur(1) // total duration in seconds

<button onclick="playPrev(this)">Listen</button>


Similar mapping, but with a specific interval for each data point rather than fitting the sequence to the total duration

    var a = dtm.array([22, 56, 30, 1, 2, 6, 90, 33]);
    var itv = 0.3; // interval in second
    
    dtm.synth().play()
        .nn(a.range([60, 100]))
        .dur(a.get('len') * itv) // Total array length scaled by the interval

<button onclick="playPrev(this)">Listen</button>
