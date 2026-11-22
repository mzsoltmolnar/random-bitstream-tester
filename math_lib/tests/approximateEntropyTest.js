// NIST SP 800-22 Approximate Entropy Test
// Based on NIST STS src/approximateEntropy.c

Object.assign(RandomTests.prototype, {
    approximateEntropyTest() {
        let n = this.randomBinSequence.length;
        let m = 2;
        let epsilon = this.randomBinSequence;

        let i, j, k, r, blockSize, seqLength, powLen, index;
        let sum, numOfBlocks, ApEn = [], apen, chiSqr, pValue;
        let P = [];

        if (n < 100) {
            console.warn("Sequence is too short. A minimum length of 100 bit is needed.");
            return {
                name: this.approximateEntropyTest.name,
                pValue: 0.0,
                n: n,
                m: m,
                seqLength: n,
                ApEn_0: 0.0,
                ApEn_1: 0.0,
                apen: 0.0,
                chiSqr: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        seqLength = n;
        r = 0;

        for (blockSize = m; blockSize <= m + 1; blockSize++) {
            if (blockSize === 0) {
                ApEn[0] = 0.00;
                r++;
            } else {
                numOfBlocks = seqLength;
                powLen = Math.trunc(Math.pow(2, blockSize + 1)) - 1;

                for (i = 1; i < powLen; i++) {
                    P[i] = 0;
                }

                for (i = 0; i < numOfBlocks; i++) {     /* COMPUTE FREQUENCY */
                    k = 1;
                    for (j = 0; j < blockSize; j++) {
                        k *= 2;
                        if (epsilon[(i + j) % seqLength] === 1) {
                            k++;
                        }
                    }
                    P[k - 1]++;
                }

                sum = 0.0;
                index = Math.trunc(Math.pow(2, blockSize)) - 1;
                for (i = 0; i < Math.trunc(Math.pow(2, blockSize)); i++) {
                    if (P[index] > 0) {
                        sum += P[index] * Math.log(P[index] / numOfBlocks);
                    }
                    index++;
                }
                sum /= numOfBlocks;
                ApEn[r] = sum;
                r++;
            }
        }
        apen = ApEn[0] - ApEn[1];

        chiSqr = 2.0 * seqLength * (Math.log(2) - apen);
        pValue = MathFunc.igamc(Math.pow(2, m - 1), chiSqr / 2.0);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.approximateEntropyTest.name,
            pValue: pValue,
            n: n,
            m: m,
            seqLength: seqLength,
            ApEn_0: ApEn[0],
            ApEn_1: ApEn[1],
            apen: apen,
            chiSqr: chiSqr,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
