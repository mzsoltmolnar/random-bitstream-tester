// NIST SP 800-22 Random Excursions Test
// Based on NIST STS src/randomExcursions.c

Object.assign(RandomTests.prototype, {
    randomExcursionsTest() {
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;
        let pValueOutOfRange = false;

        let b, i, j, k, J, x;
        let cycleStart, cycleStop, cycle = [], S_k = [];
        let stateX = [-4, -3, -2, -1, 1, 2, 3, 4];
        let counter = [0, 0, 0, 0, 0, 0, 0, 0];
        let pValue = [], sum, constraint, nu = [];

        if (n < 1000000) {
            console.warn("Sequence is too short. A minimum length of 1000000 bit is needed.");
            return {
                name: this.randomExcursionsTest.name,
                pValue: [0.0],
                minPValue: 0.0,
                n: n,
                cycleCount: 0,
                constraint: 0.0,
                sum: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        for (i = 0; i < 6; i++) {
            nu[i] = [];
        }

        let pi = [
            [0.0000000000, 0.00000000000, 0.00000000000, 0.00000000000, 0.00000000000, 0.0000000000],
            [0.5000000000, 0.25000000000, 0.12500000000, 0.06250000000, 0.03125000000, 0.0312500000],
            [0.7500000000, 0.06250000000, 0.04687500000, 0.03515625000, 0.02636718750, 0.0791015625],
            [0.8333333333, 0.02777777778, 0.02314814815, 0.01929012346, 0.01607510288, 0.0803755143],
            [0.8750000000, 0.01562500000, 0.01367187500, 0.01196289063, 0.01046752930, 0.0732727051]
        ];

        J = 0;                                          /* DETERMINE CYCLES */
        S_k[0] = 2 * epsilon[0] - 1;
        for (i = 1; i < n; i++) {
            S_k[i] = S_k[i - 1] + 2 * epsilon[i] - 1;
            if (S_k[i] === 0) {
                J++;
                if (J > Math.max(1000, Math.trunc(n / 100))) {
                    console.warn("randomExcursionsTest: EXCEEDING THE MAX NUMBER OF CYCLES EXPECTED INSUFFICIENT NUMBER OF CYCLES.");
                    return {
                        name: this.randomExcursionsTest.name,
                        pValue: [0.0],
                        minPValue: 0.0,
                        n: n,
                        cycleCount: J,
                        constraint: 0.0,
                        sum: 0.0,
                        pValueOutOfRange: false,
                        isError: true
                    };
                }
                cycle[J] = i;
            }
        }
        if (S_k[n - 1] !== 0) {
            J++;
        }
        cycle[J] = n;

        constraint = Math.max(0.005 * Math.pow(n, 0.5), 500);
        if (J < constraint) {
            console.warn("randomExcursionsTest: TEST NOT APPLICABLE. THERE ARE AN INSUFFICIENT NUMBER OF CYCLES.");
            return {
                name: this.randomExcursionsTest.name,
                pValue: [0.0],
                minPValue: 0.0,
                n: n,
                cycleCount: J,
                constraint: constraint,
                sum: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        cycleStart = 0;
        cycleStop = cycle[1];
        for (k = 0; k < 6; k++) {
            for (i = 0; i < 8; i++) {
                nu[k][i] = 0.;
            }
        }
        for (j = 1; j <= J; j++) {                      /* FOR EACH CYCLE */
            for (i = 0; i < 8; i++) {
                counter[i] = 0;
            }
            for (i = cycleStart; i < cycleStop; i++) {
                if ((S_k[i] >= 1 && S_k[i] <= 4) || (S_k[i] >= -4 && S_k[i] <= -1)) {
                    b = (S_k[i] < 0) ? 4 : 3;
                    counter[S_k[i] + b]++;
                }
            }
            cycleStart = cycle[j] + 1;
            if (j < J) {
                cycleStop = cycle[j + 1];
            }

            for (i = 0; i < 8; i++) {
                if ((counter[i] >= 0) && (counter[i] <= 4)) {
                    nu[counter[i]][i]++;
                } else if (counter[i] >= 5) {
                    nu[5][i]++;
                }
            }
        }

        for (i = 0; i < 8; i++) {
            x = stateX[i];
            sum = 0.;
            for (k = 0; k < 6; k++) {
                sum += Math.pow(nu[k][i] - J * pi[Math.trunc(Math.abs(x))][k], 2) / (J * pi[Math.trunc(Math.abs(x))][k]);
            }
            pValue[i] = MathFunc.igamc(2.5, sum / 2.0);

            if (pValue[i] < 0 || pValue[i] > 1) {
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
            name: this.randomExcursionsTest.name,
            pValue: pValue,
            minPValue: minPValue,
            n: n,
            cycleCount: J,
            constraint: constraint,
            sum: sum,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
