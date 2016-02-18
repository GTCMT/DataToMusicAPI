# Basics of loading and accessing data

With the dtm.data module, data (e.g., csv, JSON, audio file, image, and some web data via REST API) are loaded or acquired asynchronously, and we can use a callback function to access them when they are ready.

    dtm.data('filepath' callback);
    
    function callback(d) {
        // d is the data object that you loaded
    }

If you are loading your own file, the file path should be a relative path in your application (e.g., 'data/sample.csv'), not a local or HTTP URL (e.g., 'file:///c:/data/sample.csv' or 'http://mywebsite.com/sample.csv', otherwise the same-origin policy of your web browser will block the loading of the data.

The dtm.data also returns a promise object that can be accessed elsewhere later. Use obj.then() method
    
    var p = dtm.data('filepath')
    p.then(callback);

The dtm.load is an alias for dtm.data, and you can do

    dtm.load('filepath').then(callback);

Using an anonymous function as the callback, for example, you can access the content of the data in the following way:
    
    dtm.data('filepath').then(function (data) {
        data.get('size') // -> {row: n, col: m}
        data.get('keys') // -> ['foo', 'bar', etc.]
    
        data.col(0) // -> dtm.array
        data.col('foo') // -> dtm.array
    
        data.row(0) // -> dtm.array
    });

The loaded data is stored in a nested (multi-dimensional) dtm.array format. 

If you want to load custom files, you can prompt the user (or yourself) to load local files via the HTML5 input element. In the input element tag, set a event listener function like onchange="myFileLoadFunc(this)", then in JavaScript, 
    
    function myFileLoadFunc(elem) {
        dtm.data(elem.files, function (d) {
            // 
        });    
    }




