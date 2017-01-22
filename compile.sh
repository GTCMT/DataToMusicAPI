#!/usr/bin/env bash

emcc -O3 src/emscripten/worker.cpp \
-I src/emscripten/worker.h src/emscripten/lib/kiss_fft130/kiss_fft.c \
-o src/emscripten/out/worker.js \
-s EXPORT_NAME="'EM'" \
-s EXPORTED_FUNCTIONS="['_normalize', '_fft', '_fftFilter', '_spectralCentroid', '_linearInterp']" \
--memory-init-file 0