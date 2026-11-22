// NIST SP 800-22 Random Excursions Variant Test
// Based on NIST STS src/randomExcursionsVariant.c

Object.assign(RandomTests.prototype, {
    randomExcursionsVariantTest() {
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;
        let pValueOutOfRange = false;

        let i, p, J, x, constraint, count, S_k = [];
        let stateX = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let pValue = [];

        if (n < 1000000) {
            console.warn("Sequence is too short. A minimum length of 1000000 bit is needed.");
            return {
                name: this.randomExcursionsVariantTest.name,
                pValue: [0.0],
                minPValue: 0.0,
                n: n,
                cycleCount: 0,
                constraint: 0.0,
                count: 0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        J = 0;
        S_k[0] = 2 * epsilon[0] - 1;
        for (i = 1; i < n; i++) {
            S_k[i] = S_k[i - 1] + 2 * epsilon[i] - 1;
            if (S_k[i] === 0) {
                J++;
            }
        }
        if (S_k[n - 1] !== 0) {
            J++;
        }

        constraint = Math.trunc(Math.max(0.005 * Math.pow(n, 0.5), 500));
        if (J < constraint) {
            console.warn("randomExcursionsVariantTest: TEST NOT APPLICABLE. THERE ARE AN INSUFFICIENT NUMBER OF CYCLES.");
            return {
                name: this.randomExcursionsVariantTest.name,
                pValue: [0.0],
                minPValue: 0.0,
                n: n,
                cycleCount: 0,
                constraint: 0.0,
                count: 0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        for (p = 0; p <= 17; p++) {
            x = stateX[p];
            count = 0;
            for (i = 0; i < n; i++) {
                if (S_k[i] === x) {
                    count++;
                }
            }
            pValue[p] = MathFunc.erfc(Math.abs(count - J) / (Math.sqrt(2.0 * J * (4.0 * Math.abs(x) - 2))));

            if (pValue[p] < 0 || pValue[p] > 1) {
                pValueOutOfRange = true;
            }
        }

        let minPValue = Infinity;
        for (i = 0; i < pValue.length; i++) {
            if (pValue[i] < minPValue) {
                minPValue = pValue[i];
            }
        }

        let result = {
            name: this.randomExcursionsVariantTest.name,
            pValue: pValue,
            minPValue: minPValue,
            n: n,
            cycleCount: J,
            constraint: constraint,
            count: count,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
