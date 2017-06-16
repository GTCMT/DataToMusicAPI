dtm.parser = {
    type: 'dtm.parser',

    csvToJson: function (csv) {
        var lines = csv.split("\n"); // \r for Macs
        var result = [];
        var headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");

            if (currentline.length > 1) {
                for (var j = 0; j < headers.length; j++) {
                    var val = currentline[j];
                    if (!isNaN(val)) {
                        val = Number.parseFloat(val);
                    }
                    obj[headers[j]] = val;
                }

                result.push(obj);
            }
        }

        return result; //JavaScript object
//        return JSON.stringify(result); //JSON
    },

    csvToCols: function (csvText) {
        var linebreak = csvText.indexOf('\n') > -1 ? '\n' : '\r';
        var lines = csvText.split(linebreak);
        var headers = lines[0].split(",");

        var obj = {}, empty = 0;

        function dealWithCommas(lineArr) {
            for (var i = lineArr.length-1; i > 0; i--) {
                if (isString(lineArr[i-1]) && isString(lineArr[i])) {
                    if (lineArr[i].endsWith('"') || lineArr[i].endsWith('"')) {
                        lineArr[i-1] = lineArr[i-1].concat(', ' + lineArr[i]);
                        lineArr.splice(i, 1);
                    }
                }
            }
            return lineArr;
        }

        headers.forEach(function (v, i) {
            // remove new-line, etc.
            headers[i] = v.trim();

            // remove redundant double quotes
            if (v[0] === '"' && v[v.length-1] === '"') {
                v = v.slice(1, -1);
            }
            headers[i] = v.trim(); // removes redundant spaces at the both ends

            if (v === '') {
                headers[i] = '(empty_' + (empty++) + ')';
            }
        });

        headers = dealWithCommas(headers);

        headers.forEach(function (v) {
            obj[v] = [];
        });

        for (var i = 1; i < lines.length; i++) {
            var currentline = lines[i].split(",");

            if (currentline.length > 1) {
                for (var j = 0; j < currentline.length; j++) {
                    var val = currentline[j];

                    // remove redundant double quotes
                    if (val[0] === '"' && val[val.length-1] === '"') {
                        val = val.slice(1, -1);
                    }

                    val = val.trim();

                    if (!isNaN(val)) {
                        val = parseFloat(val);
                    }

                    if (isNaNfast(val)) {
                        val = null;
                    }

                    currentline[j] = val;
                }

                currentline = dealWithCommas(currentline);

                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]].push(currentline[j]);
                }
            }
        }

        return obj; //JavaScript object
    },

    valueTypes: function (row) {
        var types = [];

        row.forEach(function (val, idx) {
            var parsedVal = parseFloat(val);

            if (isNaN(parsedVal)) {
                types.push('string');
            } else {
                if (val.indexOf('.') > -1) {
                    types.push('float');
                } else {
                    types.push('int');
                }
            }
        });

        return types;
    },

    // CHECK: this only works w/ json...
    getSize: function (json) {
        var col = numProperties(json[0]); // header
        var row = numProperties(json);
        return [col, row];
    }
};