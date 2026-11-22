// NIST SP 800-22 Frequency (Monobit) Test
// Based on NIST STS src/frequency.c

Object.assign(RandomTests.prototype, {
    frequencyTest() {
        let n = this.randomBinSequence.length;

        if (n < 100) {
            console.warn("Sequence is too short. A minimum length of 100 bit is needed.");
            return {
                name: this.frequencyTest.name,
                pValue: 0.0,
                n: n,
                sSum: 0.0,
                sObs: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += -1 + 2 * this.randomBinSequence[i];
        }
        let sObs = Math.abs(sum) / Math.sqrt(n);
        let tempFrac = sObs / Math.SQRT2;
        let pValue = MathFunc.erfc(tempFrac);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.frequencyTest.name,
            pValue: pValue,
            n: n,
            sSum: sum,
            sObs: sObs,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
