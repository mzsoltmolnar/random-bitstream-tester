// NIST SP 800-22 Discrete Fourier Transform (Spectral) Test
// Based on NIST STS src/discreteFourierTransform.c

Object.assign(RandomTests.prototype, {
    dftSpectralTest() {
        let n = this.randomBinSequence.length;

        if (n < 1000) {
            console.warn("Sequence is too short. A minimum length of 1000 bit is needed.");
            return {
                name: this.dftSpectralTest.name,
                pValue: 0.0,
                n: n,
                percentile: 0.0,
                N_l: 0,
                N_o: 0.0,
                d: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        let X_re = new Float64Array(n);
        let X_im = new Float64Array(n);
        for (let i = 0; i < n; i++) {
            X_re[i] = 2 * this.randomBinSequence[i] - 1;
        }

        FFT.forward(X_re, X_im);                            /* APPLY FORWARD FFT */

        /* COUNT THE MODULI OF THE FIRST n/2 COEFFICIENTS (INCLUDING k = 0) BELOW THE 95% PEAK HEIGHT THRESHOLD */
        let half = Math.trunc(n / 2);
        let upperBound = Math.sqrt(2.995732274 * n);
        let count = 0;
        for (let k = 0; k < half; k++) {
            let modulus = Math.sqrt(Math.pow(X_re[k], 2) + Math.pow(X_im[k], 2));
            if (modulus < upperBound) {
                count++;
            }
        }
        let percentile = count / half * 100;
        let N_l = count;                                    /* number of peaks less than the threshold */
        let N_o = 0.95 * n / 2.0;                           /* expected number of peaks less than the threshold */
        let d = (N_l - N_o) / Math.sqrt(n / 4.0 * 0.95 * 0.05);
        let pValue = MathFunc.erfc(Math.abs(d) / Math.sqrt(2.0));

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.dftSpectralTest.name,
            pValue: pValue,
            n: n,
            percentile: percentile,
            N_l: N_l,
            N_o: N_o,
            d: d,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
