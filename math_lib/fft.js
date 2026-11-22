// Fast Fourier Transform used by the Discrete Fourier Transform (Spectral) test.
// Works for any sequence length: power-of-two lengths use an iterative radix-2 FFT,
// all other lengths use Bluestein's algorithm (chirp-z transform) on top of it.

class FFT {
    static cachedTwiddles = null;

    constructor() {
    }

    // In-place forward DFT of the complex sequence (re, im):
    // X[k] = sum_j x[j] * exp(-2*pi*i*j*k/n)
    static forward(re, im) {
        let n = re.length;
        if (im.length !== n) {
            throw new Error("FFT.forward: re and im must have the same length");
        }
        if (n <= 1) {
            return;
        }
        if ((n & (n - 1)) === 0) {
            this.radix2(re, im);
        } else {
            this.bluestein(re, im);
        }
    }

    // Cosine/sine table for exp(-2*pi*i*k/n), k < n/2. The last table is cached
    // because Bluestein's algorithm runs three transforms of the same size.
    static twiddles(n) {
        if (this.cachedTwiddles && this.cachedTwiddles.n === n) {
            return this.cachedTwiddles;
        }
        let half = n >> 1;
        let cos = new Float64Array(half);
        let sin = new Float64Array(half);
        for (let k = 0; k < half; k++) {
            let angle = 2 * Math.PI * k / n;
            cos[k] = Math.cos(angle);
            sin[k] = Math.sin(angle);
        }
        this.cachedTwiddles = { n: n, cos: cos, sin: sin };
        return this.cachedTwiddles;
    }

    // Iterative in-place radix-2 FFT, n must be a power of two
    static radix2(re, im) {
        let n = re.length;
        let i, j, k, bit, temp;

        for (i = 1, j = 0; i < n; i++) {            /* BIT-REVERSAL PERMUTATION */
            bit = n >> 1;
            for (; j & bit; bit >>= 1) {
                j ^= bit;
            }
            j ^= bit;
            if (i < j) {
                temp = re[i]; re[i] = re[j]; re[j] = temp;
                temp = im[i]; im[i] = im[j]; im[j] = temp;
            }
        }

        let tw = this.twiddles(n);
        for (let size = 2; size <= n; size <<= 1) {  /* BUTTERFLIES */
            let halfSize = size >> 1;
            let step = n / size;
            for (let start = 0; start < n; start += size) {
                for (k = 0; k < halfSize; k++) {
                    let a = start + k;
                    let b = a + halfSize;
                    let wr = tw.cos[k * step];
                    let wi = -tw.sin[k * step];
                    let xr = re[b] * wr - im[b] * wi;
                    let xi = re[b] * wi + im[b] * wr;
                    re[b] = re[a] - xr;
                    im[b] = im[a] - xi;
                    re[a] += xr;
                    im[a] += xi;
                }
            }
        }
    }

    // Bluestein's algorithm: expresses a DFT of any length n as a convolution,
    // which is evaluated with power-of-two FFTs of length m >= 2n - 1
    static bluestein(re, im) {
        let n = re.length;
        let m = 1;
        while (m < 2 * n - 1) {
            m <<= 1;
        }

        // chirp w[k] = exp(-pi*i*k^2/n); k^2 is reduced mod 2n to keep the angle accurate
        let wCos = new Float64Array(n);
        let wSin = new Float64Array(n);
        for (let k = 0; k < n; k++) {
            let angle = Math.PI * ((k * k) % (2 * n)) / n;
            wCos[k] = Math.cos(angle);
            wSin[k] = -Math.sin(angle);
        }

        let aRe = new Float64Array(m), aIm = new Float64Array(m);
        let bRe = new Float64Array(m), bIm = new Float64Array(m);
        for (let k = 0; k < n; k++) {
            aRe[k] = re[k] * wCos[k] - im[k] * wSin[k];   // a[k] = x[k] * w[k]
            aIm[k] = re[k] * wSin[k] + im[k] * wCos[k];
        }
        bRe[0] = wCos[0];                                // b[k] = conj(w[|k|])
        bIm[0] = -wSin[0];
        for (let k = 1; k < n; k++) {
            bRe[k] = bRe[m - k] = wCos[k];
            bIm[k] = bIm[m - k] = -wSin[k];
        }

        this.radix2(aRe, aIm);
        this.radix2(bRe, bIm);
        for (let k = 0; k < m; k++) {                    // pointwise product, conjugated for the inverse
            let pr = aRe[k] * bRe[k] - aIm[k] * bIm[k];
            let pi = aRe[k] * bIm[k] + aIm[k] * bRe[k];
            aRe[k] = pr;
            aIm[k] = -pi;
        }
        this.radix2(aRe, aIm);                           // inverse FFT = conj(FFT(conj(.))) / m

        for (let k = 0; k < n; k++) {                    // X[k] = conv[k] * w[k]
            let cr = aRe[k] / m;
            let ci = -aIm[k] / m;
            re[k] = cr * wCos[k] - ci * wSin[k];
            im[k] = cr * wSin[k] + ci * wCos[k];
        }
        this.cachedTwiddles = null;                      // release the large table
    }
}
