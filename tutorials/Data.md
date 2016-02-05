Loading and accesing data

    dtm.load('filepath').then(function (data) {
        data.get('size') // -> {row: n, col: m}
        data.get('keys') // -> ['foo', 'bar', etc.]
    
        data.col(0) // -> dtm.array
        data.col('key1') -> dtm.array
    
        data.row(0)
    });


