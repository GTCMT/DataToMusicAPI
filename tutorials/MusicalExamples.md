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


# Sequencing

    var seq = dtm.array(
        [0,4,7,12,16], 
        [0,2,9,14,17],
        [-1,2,7,14,17],
        [0,4,7,12,16],
        [0,4,9,16,21],
        [0,2,6,9,14],
        [-1,2,7,14,19],
        [-1,0,4,7,12],
        [-3,0,4,7,12],
        [-10,-3,2,6,12],
        [-5,-1,2,7,11]
    ).map(function(a){
        // For each sub-list, append the last 3 notes, then repeat twice 
        return a.concat(a.get([-3,-2,-1])).rep(2)
    })
    
    dtm.s().play()
        .dur(3) // Each segment is played over the period of 3 seconds
        .rep(seq.get('len')) // Iterate through the seq list, then stop
        .nn(60) // Set the base note
        .nn.add(seq) // Modulate the pitch by addition

<button onclick="playPrev(this)">Listen</button>

