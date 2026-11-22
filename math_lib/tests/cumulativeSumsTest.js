// NIST SP 800-22 Cumulative Sums (Cusum) Test
// Based on NIST STS src/cusum.c

Object.assign(RandomTests.prototype, {
    cumulativeSumsTest() {
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;

        let S, sup, inf, z, zrev, k;
        let sum1, sum2, pValueFWD, pValueREV;

        if (n < 100) {
            console.warn("Sequence is too short. A minimum length of 100 bit is needed.");
            return {
                name: this.cumulativeSumsTest.name,
                pValueFWD: 0.0,
                pValueREV: 0.0,
                n: n,
                z: 0,
                zrev: 0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        S = 0;
        sup = 0;
        inf = 0;
        for (k = 0; k < n; k++) {
            epsilon[k] ? S++ : S--;
            if (S > sup) {
                sup++;
            }
            if (S < inf) {
                inf--;
            }
            z = (sup > -inf) ? sup : -inf;
            zrev = (sup - S > S - inf) ? sup - S : S - inf;
        }

        // forward
        sum1 = 0.0;
        for (k = Math.trunc((Math.trunc(-n / z) + 1) / 4); k <= Math.trunc((Math.trunc(n / z) - 1) / 4); k++) {
            sum1 += MathFunc.normal(((4 * k + 1) * z) / Math.sqrt(n));
            sum1 -= MathFunc.normal(((4 * k - 1) * z) / Math.sqrt(n));
        }
        sum2 = 0.0;
        for (k = Math.trunc((Math.trunc(-n / z) - 3) / 4); k <= Math.trunc((Math.trunc(n / z) - 1) / 4); k++) {
            sum2 += MathFunc.normal(((4 * k + 3) * z) / Math.sqrt(n));
            sum2 -= MathFunc.normal(((4 * k + 1) * z) / Math.sqrt(n));
        }

        pValueFWD = 1.0 - sum1 + sum2;

        // backwards
        sum1 = 0.0;
        for (k = Math.trunc((Math.trunc(-n / zrev) + 1) / 4); k <= Math.trunc((Math.trunc(n / zrev) - 1) / 4); k++) {
            sum1 += MathFunc.normal(((4 * k + 1) * zrev) / Math.sqrt(n));
            sum1 -= MathFunc.normal(((4 * k - 1) * zrev) / Math.sqrt(n));
        }
        sum2 = 0.0;
        for (k = Math.trunc((Math.trunc(-n / zrev) - 3) / 4); k <= Math.trunc((Math.trunc(n / zrev) - 1) / 4); k++) {
            sum2 += MathFunc.normal(((4 * k + 3) * zrev) / Math.sqrt(n));
            sum2 -= MathFunc.normal(((4 * k + 1) * zrev) / Math.sqrt(n));
        }

        pValueREV = 1.0 - sum1 + sum2;

        let pValueOutOfRange = false;
        if (pValueFWD < 0 || pValueFWD > 1) {
            pValueOutOfRange = true;
        }
        if (pValueREV < 0 || pValueREV > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.cumulativeSumsTest.name,
            pValueFWD: pValueFWD,
            pValueREV: pValueREV,
            n: n,
            z: z,
            zrev: zrev,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
