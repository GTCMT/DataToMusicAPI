# Basics

Creating a clock object. 

    var c = dtm.clock()
    
A shorthand for creating a clock is

    dtm.c()

The clock instance will start ticking immediately after being created. You can add a task (callback) to the clock. This task function is called repeatedly as the clock ticks.

    dtm.clock(myTask);
    
    function myTask() {
        console.log('hello');
    }

A quicker way to add a task is by using anonymous functions.

    dtm.c(function () {
        // Do something.
    });

## Changing the behaviors

You can change the speed of the clock ticks in various ways. For example, to set the interval in seconds, you can do

    dtm.c(myTask).interval(0.2) // Aliases for interval() are int() and dur()

Or, you can use the beats per minute (BPM). 

    dtm.c(myTask).bpm(140)

Setting the interval or the BPM in a clock will disable the time synchronization. By default, clock instances are synchronized to a master clock, so multiple instances can trigger tasks simultaneously, or at timings relative to each other.

    var c = dtm.clock(taskA).time(1/8);
    var d = dtm.clock(taskB).time(1/12);
    
    // These are synchronized to the master clock tempo (120 by default).
    dtm.master.get('clock').bpm(90); // Change the master BPM
    
For changing the relative speed of synchronized clocks, you can use div() or time() functions.

    dtm.c().time(1/4) // This corresponds to a "quarter note" interval, dividing the BPM interval by 4
    dtm.c().div(8) // This divides the BPM interval by 8, so it's faster.


You can access the clock instance from within the task function.

    var myData = [1, 2, 3];
    var index = 0;
    
    dtm.clock(function (c) {
        c.div(myData[index]);
        index = (index + 1) % myData.length // Cycle through the array values.
    }).bpm(180)


# Using dtm.synth with clock

    dtm.c(function () {
        dtm.synth().play()
            .amp(dtm.decay());
    });
    



