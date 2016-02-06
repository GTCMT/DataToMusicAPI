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

# Basic

Vibrato using sine generator

    var vib = dtm.gen('cos') // Generate an array with cosine wave
        .phase(0.5) // Start from the lowest value
        .freq(4) // Repeat 4 times within the fixed size
        .range(0,2) // Rescale from [-1,1] to [0,2]
    
    dtm.syn().play().dur(2)
        .nn(72) // Base pitch
        .nn.add(vib) // Additive modulation
        
<button onclick="playPrev(this)">Listen</button>


