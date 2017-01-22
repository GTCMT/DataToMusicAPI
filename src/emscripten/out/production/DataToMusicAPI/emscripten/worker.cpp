#include "worker.h"

extern "C" {

void normalize(float* data, int len, float min, float max) {
    float denom = 1.0;

    if (max == min) {
        if (min > 0 && min <= 1) {
            min = 0;
        } else if (min > 1) {
            min -= 1;
        }
    } else {
        denom = max - min;
    }

    for (int i = 0; i < len; i++) {
        data[i] = (data[i] - min) / denom;
    }
}

void fft(float* data, int len) {
    kiss_fft_cfg fwd = kiss_fft_alloc(len, false, 0, 0);
    kiss_fft_cfg inv = kiss_fft_alloc(len, true, 0, 0);

    kiss_fft_cpx cai[len], cao[len];

    for (int i = 0; i < len; i++) {
        cai[i].r = data[i];
        cai[i].i = 0.0;
    }

    kiss_fft(fwd, cai, cao);

    for (int i = 0; i < len; i++) {
        data[i] = sqrt(pow(cao[i].r, 2) + pow(cao[i].i, 2));
    }

    free(fwd);
    free(inv);
}

void fftFilter(float* timeSig, float* magSpec, int len) {
    kiss_fft_cfg fwd = kiss_fft_alloc(len, false, 0, 0);
    kiss_fft_cfg inv = kiss_fft_alloc(len, true, 0, 0);

    kiss_fft_cpx cai[len], cao[len], cbi[len], cbo[len];

    for (int i = 0; i < len; i++) {
        cai[i].r = timeSig[i];
        cai[i].i = 0.0;
    }

    kiss_fft(fwd, cai, cao);

    for (int i = 0; i < len; i++) {
        cbi[i].r = cao[i].r * magSpec[i];
        cbi[i].i = 0;
    }

    kiss_fft(inv, cbi, cbo);

    for (int i = 0; i < len; i++) {
        timeSig[i] = cbo[i].r / (float)len;
    }

    free(fwd);
    free(inv);
}

// return normalized frequency for now
float spectralCentroid(float* timeSig, int len, int fs) {
    int hFftLen = len / 2;
    kiss_fft_cfg fwd = kiss_fft_alloc(len, false, 0, 0);
    kiss_fft_cpx cai[len], cao[len];

    for (int i = 0; i < len; i++) {
        cai[i].r = timeSig[i];
        cai[i].i = 0.0;
    }

    kiss_fft(fwd, cai, cao);

    float magSum = 0;
    float numerator = 0;
    for (int i = 0; i < hFftLen; i++) {
        magSum += pow(cao[i].r, 2);
        numerator += (float)i * pow(cao[i].r, 2);
    }

    free(fwd);
    return numerator / magSum * (float)fs / (float)len;
}

float sum(float* data, int len) {
    float res = 0.0;

    for (int i = 0; i < len; i++) {
        res += data[i];
    }

    return res;
}

void linearInterp(float* data, int inLen, int outLen) {
    int inNumItv = inLen - 1;
    int outNumItv = outLen - 1;
    int intermLen = inNumItv * outNumItv + 1;
    float intermArr[intermLen];

    int c = 0, j, k;
    for (j = 0; j < inNumItv; j++) {
        for (int i = 0; i < outNumItv; i++) {
            intermArr[c] = data[j] + (data[j + 1] - data[j]) * ((float)i / (float)outNumItv);
            c++;
        }
    }
    intermArr[c] = data[j];

    for (k = 0; k < outNumItv; k++) {
        data[k] = intermArr[k * inNumItv];
    }
    data[k] = intermArr[intermLen - 1];
}

}