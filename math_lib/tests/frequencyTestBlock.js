// NIST SP 800-22 Frequency Test within a Block
// Based on NIST STS src/blockFrequency.c

Object.assign(RandomTests.prototype, {
    frequencyTestBlock() {
        let n = this.randomBinSequence.length;

        if (n < 100) {
            console.warn("Sequence is too short. A minimum length of 100 bit is needed.");
            return {
                name: this.frequencyTestBlock.name,
                pValue: 0.0,
                n: n,
                M: 0,
                N: 0,
                chiSqr: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        let M = 128; // block size
        let N = Math.trunc(n / M); // block count

        let piArray = [];
        for (let i = 0; i < N; i++) {
            let tempSum = 0;
            for (let j = i * M; j < i * M + M; j++) {
                tempSum += this.randomBinSequence[j];
            }
            piArray.push(tempSum / M);
        }

        let chiSqr = 0;
        for (let i = 0; i < piArray.length; i++) {
            chiSqr += Math.pow((piArray[i] - 0.5), 2);
        }
        chiSqr = chiSqr * 4 * M;

        let pValue = MathFunc.igamc(N / 2, chiSqr / 2);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.frequencyTestBlock.name,
            pValue: pValue,
            n: n,
            M: M,
            N: N,
            chiSqr: chiSqr,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
