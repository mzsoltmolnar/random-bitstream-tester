// NIST SP 800-22 Runs Test
// Based on NIST STS src/runs.c

Object.assign(RandomTests.prototype, {
    runsTest() {
        let n = this.randomBinSequence.length;

        if (n < 100) {
            console.warn("Sequence is too short. A minimum length of 100 bit is needed.");
            return {
                name: this.runsTest.name,
                pValue: 0.0,
                n: n,
                sum: 0.0,
                piObs: 0.0,
                tau: 0.0,
                vObs: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += this.randomBinSequence[i];
        }
        let piObs = sum / n;
        let tau = 2.0 / Math.sqrt(n);

        if (Math.abs(piObs - 0.5) > tau) {
            console.warn("PI ESTIMATOR CRITERIA NOT MET!");
            return {
                name: this.runsTest.name,
                pValue: 0.0,
                n: n,
                sum: sum,
                piObs: piObs,
                tau: tau,
                vObs: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        let vObs = 1;
        for (let i = 1; i < n; i++) {
            if (this.randomBinSequence[i] !== this.randomBinSequence[i - 1]) {
                vObs++;
            }
        }
        let tempValue = Math.abs((vObs - 2 * n * piObs * (1 - piObs))) / (2 * piObs * (1 - piObs) * Math.sqrt(2 * n));
        let pValue = MathFunc.erfc(tempValue);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.runsTest.name,
            pValue: pValue,
            n: n,
            sum: sum,
            piObs: piObs,
            tau: tau,
            vObs: vObs,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
