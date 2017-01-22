#include "cmath"
#include "lib/kiss_fft130/kiss_fft.h"

extern "C" {
void normalize(float* data, int len, float min=0, float max=1);
void fft(float* data, int len);
void fftFilter(float* timeSig, float* magSpec, int len);
float spectralCentroid(float* timeSig, int len, int fs=44100);
void linearInterp(float* data, int inLen, int outLen);
}