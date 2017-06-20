var app = angular.module('dtmDemo', []);
var data = [], url, file;
var useOsc = false;

var temp, humid;

Float32Array.prototype.map = function(callback, thisArg) {
    var T, A, k;

    if (this == null) {
        throw new TypeError(' this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;

    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }

    if (arguments.length > 1) {
        T = thisArg;
    }

    A = new Array(len);

    k = 0;

    while (k < len) {

        var kValue, mappedValue;
        if (k in O) {
            kValue = O[k];
            mappedValue = callback.call(T, kValue, k, O);
            A[k] = mappedValue;
        }
        k++;
    }
    return A;
};

app.controller('MainController', function ($scope) {
    url = Cookies.get('url');

    function setBackgroundImage(_url) {
        if (!_url) {
            _url = url;
        }
        if (_url.endsWith('jpg') || _url.endsWith('png') || _url.endsWith('gif')) {
            document.body.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(' + _url + ')';
        }  else if (_url.startsWith('data:')) {
            document.body.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(' + _url + ')';
        } else if (_url === '') {
            document.body.style.backgroundImage = 'none';
            Cookies.set('url', _url);
        }
    }

    var svgW = window.innerWidth - 60, svgH = 300;
    var svg = d3.select('#vis')
        .append('svg')
        .attr('width', svgW)
        .attr('height', svgH);

    var dataLen = 1;

    var line = d3.line()
        .x(function (d, i) {
            return i / (dataLen-1) * svgW;
        })
        .y(function (d) {
            return d;
        })
        .curve(d3.curveStep);

    svg.append('path')
        .attr('class', 'line')
        .attr('stroke', 'white')
        .attr('stroke-width', '2')
        .attr('fill', 'none');

    var csl = CodeMirror.fromTextArea(document.getElementById('console'), {
        theme: 'monokai',
        indentUnit: 2,
        tabSize: 2,
        lineNumbers: true,
        lineWrapping: true,
        lineNumberFormatter: function (i) {
            return '';
        },
        gutters: ['CodeMirror-linenumbers', 'breakpoints'],
        scrollbarStyle: "null"
    });

    var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        indentUnit: 2,
        tabSize: 2,
        lineNumbers: true,
        lineWrapping: true,
        theme: 'monokai',
        autofocus: true,
        highlightSelectionMatches: true,
        gutters: ['CodeMirror-linenumbers', 'breakpoints'],
        keyMap: 'sublime',
        scrollbarStyle: "null",
        autoCloseBrackets: true,
        matchBrackets: true
    });

    editor.ondragover = function (e) {
        e.preventDefault();
    };

    editor.ondrop = function (e) {
        e.preventDefault();
        var length = e.dataTransfer.items.length;
    };

    document.body.addEventListener("click", function () {
        editor.focus();
    });

    editor.on('gutterClick', function (cm, n) {
        var info = cm.lineInfo(n);
        cm.setGutterMarker(n, 'breakpoints', info.gutterMarkers ? null : makeMarker());
    });

    function makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#822";
        marker.innerHTML = "●";
        return marker;
    }

    function toggleBreakpoint() {
        var n = editor.getCursor().line;
        var info = editor.lineInfo(n);
        editor.setGutterMarker(n, 'breakpoints', info.gutterMarkers ? null : makeMarker());
    }

    var setupFn = {};
    var isAutoEvaled = false;
    var cslLineNumbers = [];
    var cslLineTexts = [];

    $scope.init = function init() {
        //dtm.startWebAudio();

        if (useOsc) {
            dtm.startOsc();
        }

        var pos = editor.getCursor();
        var params = window.location.search.substring(1).split("=");

        if (params[0] === 'code') {
            editor.replaceRange(decodeURIComponent(params[1]), pos);
            //editor.setValue('');
        } else {
            if (Cookies.get('code') !== undefined) {
                loadFromCookie();
            }
        }
        
        Array.prototype.wrap = function () {
            return dtm.data(this);
        };

        editor.refresh();

        if (Cookies.get('temp') !== undefined) {
            temp = dtm.data(Cookies.get('temp').split(',')).tonumber();
        }
        if (Cookies.get('humid') !== undefined) {
            humid = dtm.data(Cookies.get('humid').split(',')).tonumber();
        }
    };

    function setup(cb) {
        if (setupFn.toString() != cb.toString()) {
            dtm.stop();

            setupFn = cb;
            setupFn();
        }
    }

    dtm.master.setup = setup;

    function flashBackground() {
        document.body.style.animation = 'none';
        setTimeout(function () {
            document.body.style.animation = 'flash 0.5s normal forwards';
        });
    }

    $scope.evalAll = function evalAll() {
        if (!dtm.osc.isOn && useOsc) {
            dtm.startOsc();
        }

        // clear plots and print
        svg.selectAll('rect').remove();
        svg.selectAll('path').attr('stroke-opacity', '0');
        csl.replaceRange('', {line:0, ch:0}, {line:100, ch:0});

        dtm.stop();

        try {
            eval(editor.getValue());
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.log(e.message);
                console.log(e.stack);
                console.error(e);
            } else {
                console.error(e);
            }
        }

        dtm.params.stream = true;
        // printFromBreakpoints();

        setBackgroundImage();
        flashBackground();

        if (temp.val) {
            Cookies.set('temp', temp.val.toString());
        }
        if (humid.val) {
            Cookies.set('humid', humid.val.toString());
        }
    };

    $scope.evalSelected = function evalSelected() {
        // if (!dtm.osc.isOn && useOsc) {
        //     dtm.startOsc();
        // }

        try {
            if (editor.getSelection() === '') {
                dtm.stop();
                eval(editor.getValue());
                flashBackground();
            } else {
                eval(editor.getSelection());
                console.log(editor.getSelection());
            }
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.log(e.message);
            }
        }

        // printFromBreakpoints();
    };

    // TODO: questionable eval inside
    function printFromBreakpoints() {
        cslLineNumbers = [];
        cslLineTexts = [];

        editor.eachLine(function (l) {
            if (l.gutterMarkers) {
                cslLineNumbers.push(l.lineNo()+1);
                cslLineTexts.push(l.text);
                // cslLog();
            }
        });
    }

    function onAutoEval() {
        try {
            dtm.stop();

            // clear plots and print
            svg.selectAll('rect').remove();
            svg.selectAll('path').attr('stroke-opacity', '0');
            csl.replaceRange('', {line:0, ch:0}, {line:100, ch:0});

            eval(editor.getValue());
            flashBackground();
        } catch (error) {

        }
    }

    $scope.startAutoEval = function() {
        console.log('starting the auto eval mode');
        isAutoEvaled = true;
        document.querySelector('#auto-button').style = 'background-color:steelblue; color:#272822';

        editor.on('change', onAutoEval);
    };

    $scope.stopAutoEval = function () {
        $scope.stop();
        console.log('stopping the auto eval mode');
        isAutoEvaled = false;
        document.querySelector('#auto-button').style = 'color:steelblue; background-color:transparent';
        editor.off('change', onAutoEval);
    };

    $scope.toggleAutoEval = function () {
        if (isAutoEvaled) {
            $scope.stopAutoEval();
        } else {
            $scope.startAutoEval();
        }
    };

    $scope.stop = function stop() {
        var idx = 0;

        var rep = setInterval(function () {
            dtm.stop();
            idx++;

            if (idx >= 10) {
                clearInterval(rep);
            }
        }, 1);

        dtm.params.stream = false;
    };

    $scope.reload = function reload() {
        window.location.reload();
    };

    function loadFromCookie() {
        if (Cookies.get('code') !== undefined) {
            var pos = editor.getCursor();
            editor.replaceRange(Cookies.get('code'), pos);
        }
    }

    var log = dtm.util.print;

    function plot(a) {
        var arr;
        var plotDiv = null;
        var min, max;
        svg.selectAll('rect').remove();

        if (dtm.util.isDtmArray(a)) {
            if (dtm.util.isNestedDtmArray(a)) {
                plotDiv = a().map(function (v) {
                    return v.length;
                });
                arr = a().flatten().get();
            } else {
                arr = a.get();
            }

        } else if (dtm.util.isNumber(a)) {
            arr = [a];
        }

        if (dtm.util.isNumOrFloat32Array(arr)) {
            var data;
            var yMargin = 5;

            if (arguments.length === 2) {
                if (dtm.util.isDtmArray(arguments[1])) {
                    min = arguments[1].get(0);
                    max = arguments[1].get(1);
                } else {
                    min = arguments[1][0];
                    max = arguments[1][1];
                }
                data = dtm.data(arr).range(svgH-yMargin, yMargin, min, max).get();
            } else if (arguments.length === 3) {
                data = dtm.data(arr).range(svgH-yMargin, yMargin, arguments[1], arguments[2]).get();
            } else {
                data = dtm.data(arr).range(svgH-yMargin, yMargin).get();
            }

            if (data.length === 1) {
                data = dtm.data(data[0]).step(100).get();
                // line.curve(d3.curveStep);
            }
            dataLen = data.length;

            svg.selectAll('path')
                .attr('stroke-opacity', '1')
                // .transition().duration(200)
                .attr('d', line(data));
            // .style('filter', 'url(#blur)')

            if (plotDiv !== null) {
                var step = svgW / (plotDiv.get('sum')-1);
                var xPos = -step * 0.5;

                for (var i = 0, l = plotDiv.length; i < l; i++) {
                    if (i !== plotDiv.length) {
                        if (i % 2 === 1) {
                            svg.append('rect')
                                .style('fill', 'white')
                                .style('fill-opacity', '0.075')
                                .attr('x', xPos)
                                .attr('y', yMargin)
                                .attr('width', step * plotDiv.get(i))
                                .attr('height', svgH-yMargin)
                        }

                        xPos += step * plotDiv.get(i);
                    }
                }
            }
        }
        return a;
    }


    dtm.setPlotter(plot);

    dtm.setPrinter(cslPrint);
    var print = cslPrint;

    function cslPrint(a) {
        csl.setOption('lineNumbers', false);
        // csl.setOption('lineNumberFormatter', function (n) {
        //     return cslLineNumbers[n-1];
        // });

        var digitLim = 5;
        var res = [];

        if (dtm.util.isDtmArray(a)) {
            if (dtm.util.isNestedDtmArray(a)) {
                a.each(function (d, i) {
                    if (dtm.util.isDtmArray(d)) {
                        var arr = d.get().map(function (w) {
                            return dtm.util.isNumber(w) ? (Math.round(w*Math.pow(10,digitLim)))/Math.pow(10,digitLim) : w;
                        }).join(', ');
                        res[i] = d.get('key') + ': [' + arr + ']';
                    } else {
                        res[i] = '[' + d.map(function (w) {
                                return dtm.util.isNumber(w) ? (Math.round(w*Math.pow(10,digitLim)))/Math.pow(10,digitLim) : w;
                            }).join(', ') + ']';
                    }
                });
                res = res.join('\n');
            } else {
                res = a.get().map(function (w) {
                    return dtm.util.isNumber(w) ? (Math.round(w*Math.pow(10,digitLim)))/Math.pow(10,digitLim) : w;
                }).join(', ');
                res = '[' + res + ']';
                if (a.get('key') !== '') {
                    res = a.get('key') + ': ' + res;
                }
            }
        } else {
            res = a.hasOwnProperty('toString') ? a.toString : a;
        }

        csl.replaceRange('' + res, {line:0, ch:0}, {line:100, ch:0});
        dtm.util.print(a);
        return a;
    }

    function localEval(l) {
        (function(m){eval(m)})(l);
    }

    function evalSelected() {
        var foo = editor.getSelection();
        eval(foo);

        var bar = editor.getCursor();
        console.log(bar['line']);
    }

    function evalLine() {
        var bar = editor.getCursor();
        var foo = editor.getLine(bar['line']);

        try {
            eval(foo);
        } catch (e) {

        }

        // printFromBreakpoints();
    }

    function evalStatement() {
        var text = editor.getSelection();

        if (text === '') {
            var cursor = editor.getCursor();
            var startCursor = {ch:0}, endCursor;

            var reverse = true;
            var forward = true;

            var currentLine = cursor.line;

            while (reverse) {
                var prevLineText = editor.getLine(--currentLine);
                if (typeof(prevLineText) === 'undefined' || prevLineText.includes(';')) {
                    currentLine++;
                    reverse = false;

                    while (forward) {
                        if (editor.getLine(currentLine) === '') {
                            currentLine++;
                        } else {
                            forward = false;
                        }
                    }
                }
                startCursor.line = currentLine;
            }

            currentLine = cursor.line;
            var currentLineText = editor.getLine(currentLine);
            if (currentLineText.includes(';')) {
                forward = false;
                endCursor = {
                    line: currentLine,
                    ch: currentLineText.length
                };
            } else {
                forward = true;
            }

            while (forward) {
                var nextLineText = editor.getLine(++currentLine);
                if (typeof(nextLineText) === 'undefined') {
                    currentLine--;
                    forward = false;
                } else if (nextLineText.includes(';')) {
                    // explicit end of statement
                    forward = false;
                }
                endCursor = {
                    line: currentLine,
                    ch: editor.getLine(currentLine).length
                };
            }

            editor.setSelection(startCursor, endCursor);
            text = editor.getSelection();
        }

        try {
            eval(text);
            flashBackground();
        } catch (error) {
            console.log(error);
        }
    }

    function pasteSampleCsv() {
        var foo = editor.getCursor();
        editor.replaceRange('sample.csv', foo);
    }

    function pasteText(txt) {
        var pos = editor.getCursor();
        editor.replaceRange('\"' + txt + '\"', pos);
    }


    $scope.openFile = function () {
        document.querySelector('#file-input').click();
    };

    $scope.fileNameChanged = function (elem) {
        var _file = elem.files[0];

        try {
            var type = _file.type.split('/');

            if (type[0] === 'image') {
                dtm.util.loadFileObject(_file, function (dataURL) {
                    file = dataURL;
                    setBackgroundImage(dataURL);
                    url = dataURL;
                });
            } else if (type[0] === 'audio') {
                dtm.wav(_file, function (d) {
                    file = d;
                });
            } else if (type[1] === 'csv') {
                dtm.csv(_file, function (d) {
                    file = d;
                });
            } else if (type[1] === 'json') {
                dtm.json(_file, function (d) {
                    file = d;
                });
            } else if (type[1] === 'plain') {
                dtm.text(_file, function (d) {
                    file = d;
                });
            }

        } catch (error) {
            console.log(error);
        }
    };

    editor.setOption('extraKeys', {
        'Cmd-R': $scope.evalAll,
        'Cmd-Enter': $scope.evalAll,
        'Ctrl-Enter': $scope.evalAll,
        'Shift-Enter': evalStatement,
        'Shift-Cmd-Enter': evalLine,
        'Cmd-E': $scope.toggleAutoEval,
        'Shift-Cmd-R': $scope.reload,
        'Shift-Ctrl-R': $scope.reload,
        'Ctrl-C': $scope.stop,
        'Cmd-.': $scope.stop,
        'Ctrl-.': $scope.stop,
        'Cmd-B': toggleBreakpoint,
        'Ctrl-Left': 'goWordLeft',
        'Ctrl-Right': 'goWordRight',
        'Ctrl-Down': 'swapLineDown',
        'Ctrl-Up': 'swapLineUp',
        // 'Shift-Enter': function () {
        //     editor.execCommand('goLineEnd');
        //     editor.execCommand('newlineAndIndent');
        //     // editor.execCommand('indentAuto');
        // },
        // 'Enter': function () {
        //     editor.execCommand('newlineAndIndent');
        //     editor.execCommand('indentAuto');
        // },
        '.': function () {
            editor.replaceRange('.', editor.getCursor(), editor.getCursor());
            editor.execCommand('indentAuto');
            // console.log(editor.getCursor())
        },
        'Cmd-Backspace': 'deleteLine',
        'Cmd-Alt-D': 'duplicateLine',
        'Cmd-/': function () {
            editor.toggleComment(editor.getCursor(true), editor.getCursor(false));
        },
        'Cmd-I': 'indentAuto'
        //'Cmd-G': findNext
    });

    editor.on('change', function () {
        Cookies.set('code', editor.getValue());
    });

    var PI;
    dtm.txt('data/pi.txt', function (data) {
        // PI = data.split().remove.at(1)(dtm.range(1000)).num();
        PI = dtm.data(3).concat(data.split()(dtm.range(2,1000)).tonum());
    });

    window.addEventListener("resize", function () {
        svgW = window.innerWidth - 60;
        svg.attr('width', svgW);
    });

    document.body.addEventListener('dragover', function (e) {
        e.preventDefault();
        return false;
    }, false);

    document.body.addEventListener('drop', function (e) {
        e.preventDefault();
        url = e.dataTransfer.getData('URL');
        cslPrint("url = '" + url + "'");
        Cookies.set('url', url);
        setBackgroundImage();
    });
});
