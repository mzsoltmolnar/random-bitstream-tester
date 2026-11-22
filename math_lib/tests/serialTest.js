// NIST SP 800-22 Serial Test
// Based on NIST STS src/serial.c

Object.assign(RandomTests.prototype, {
    serialTest() {
        let n = this.randomBinSequence.length;
        let m = 2;
        let epsilon = this.randomBinSequence;

        let pValue1, pValue2, psim0, psim1, psim2, del1, del2;

        if (n < 1000000) {
            console.warn("Sequence is too short. A minimum length of 1000000 bit is needed.");
            return {
                name: this.serialTest.name,
                pValue1: 0.0,
                pValue2: 0.0,
                n: n,
                m: m,
                pValueOutOfRange: false,
                isError: true
            };
        }

        psim0 = this.psi2(m, n, epsilon);
        psim1 = this.psi2(m - 1, n, epsilon);
        psim2 = this.psi2(m - 2, n, epsilon);
        del1 = psim0 - psim1;
        del2 = psim0 - 2.0 * psim1 + psim2;
        pValue1 = MathFunc.igamc(Math.pow(2, m - 1) / 2, del1 / 2.0);
        pValue2 = MathFunc.igamc(Math.pow(2, m - 2) / 2, del2 / 2.0);

        let pValueOutOfRange = false;
        if (pValue1 < 0 || pValue1 > 1) {
            pValueOutOfRange = true;
        }
        if (pValue2 < 0 || pValue2 > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.serialTest.name,
            pValue1: pValue1,
            pValue2: pValue2,
            n: n,
            m: m,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    },

    // needed for serialTest
    psi2(m, n, epsilon) {
        let i, j, k, powLen;
        let sum, numOfBlocks;
        let P = [];

        if ((m === 0) || (m === -1)) {
            return 0.0;
        }
        numOfBlocks = n;
        powLen = Math.trunc(Math.pow(2, m + 1)) - 1;

        for (i = 1; i < powLen; i++) {
            P[i] = 0;                                   /* INITIALIZE NODES */
        }

        for (i = 0; i < numOfBlocks; i++) {             /* COMPUTE FREQUENCY */
            k = 1;
            for (j = 0; j < m; j++) {
                if (epsilon[(i + j) % n] === 0) {
                    k *= 2;
                } else if (epsilon[(i + j) % n] === 1) {
                    k = 2 * k + 1;
                }
            }
            P[k - 1]++;
        }

        sum = 0.0;
        for (i = Math.trunc(Math.pow(2, m)) - 1; i < Math.trunc(Math.pow(2, m + 1)) - 1; i++) {
            sum += Math.pow(P[i], 2);
        }
        sum = (sum * Math.pow(2, m) / n) - n;

        return sum;
    }
});
