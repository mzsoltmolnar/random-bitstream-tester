// NIST SP 800-22 Maurer's "Universal Statistical" Test
// Based on NIST STS src/universal.c

Object.assign(RandomTests.prototype, {
    universalMaurerTest() {
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;

        let i, j, p, L, Q, K;
        let arg, sqrt2, sigma, phi, sum, pValue, c;
        let T = [], decRep;
        let expected_value = [0, 0, 0, 0, 0, 0, 5.2177052, 6.1962507, 7.1836656, 8.1764248, 9.1723243, 10.170032, 11.168765, 12.168070, 13.167693, 14.167488, 15.167379];
        let variance = [0, 0, 0, 0, 0, 0, 2.954, 3.125, 3.238, 3.311, 3.356, 3.384, 3.401, 3.410, 3.416, 3.419, 3.421];

        /* * * * * * * * * ** * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * THE FOLLOWING REDEFINES L, SHOULD THE CONDITION:     n >= 1010*2^L*L       *
         * NOT BE MET, FOR THE BLOCK LENGTH L.                                        *
         * * * * * * * * * * ** * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        if (n < 387840) {
            console.warn("Sequence is too short. A minimum length of 387840 bit is needed.");
            return {
                name: this.universalMaurerTest.name,
                pValue: 0.0,
                n: n,
                L: 0,
                Q: 0,
                K: 0,
                sum: 0.0,
                sigma: 0.0,
                variance: 0.0,
                expected_value: 0.0,
                phi: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        L = 5;
        if (n >= 387840) L = 6;
        if (n >= 904960) L = 7;
        if (n >= 2068480) L = 8;
        if (n >= 4654080) L = 9;
        if (n >= 10342400) L = 10;
        if (n >= 22753280) L = 11;
        if (n >= 49643520) L = 12;
        if (n >= 107560960) L = 13;
        if (n >= 231669760) L = 14;
        if (n >= 496435200) L = 15;
        if (n >= 1059061760) L = 16;

        Q = 10 * Math.pow(2, L);
        K = Math.trunc(n / L) - Q;                      /* BLOCKS TO TEST */

        p = Math.pow(2, L);
        if (L < 6 || L > 16 || Q < 10 * Math.pow(2, L)) {
            console.warn("L is out of range or Q < 10 * Math.pow(2, L)");
            return {
                name: this.universalMaurerTest.name,
                pValue: 0.0,
                n: n,
                L: L,
                Q: Q,
                K: K,
                sum: 0.0,
                sigma: 0.0,
                variance: 0.0,
                expected_value: 0.0,
                phi: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        /* COMPUTE THE EXPECTED:  Formula 16, in Marsaglia's Paper */
        c = 0.7 - 0.8 / L + (4 + 32 / L) * Math.pow(K, -3 / L) / 15;
        sigma = c * Math.sqrt(variance[L] / K);
        sqrt2 = Math.sqrt(2);
        sum = 0.0;
        for (i = 0; i < p; i++) {
            T[i] = 0;
        }
        for (i = 1; i <= Q; i++) {                      /* INITIALIZE TABLE */
            decRep = 0;
            for (j = 0; j < L; j++) {
                decRep += epsilon[(i - 1) * L + j] * Math.pow(2, L - 1 - j);
            }
            T[decRep] = i;
        }
        for (i = Q + 1; i <= Q + K; i++) {              /* PROCESS BLOCKS */
            decRep = 0;
            for (j = 0; j < L; j++) {
                decRep += epsilon[(i - 1) * L + j] * Math.pow(2, L - 1 - j);
            }
            sum += Math.log(i - T[decRep]) / Math.log(2);
            T[decRep] = i;
        }
        phi = sum / K;

        arg = Math.abs(phi - expected_value[L]) / (sqrt2 * sigma);
        pValue = MathFunc.erfc(arg);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.universalMaurerTest.name,
            pValue: pValue,
            n: n,
            L: L,
            Q: Q,
            K: K,
            sum: sum,
            sigma: sigma,
            variance: variance[L],
            expected_value: expected_value[L],
            phi: phi,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
