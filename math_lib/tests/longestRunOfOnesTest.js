// NIST SP 800-22 Test for the Longest Run of Ones in a Block
// Based on NIST STS src/longestRunOfOnes.c

Object.assign(RandomTests.prototype, {
    longestRunOfOnesTest() {
        let n = this.randomBinSequence.length;
        let K = 0;
        let M = 0; // block size

        let piVal = [];
        let V = [];
        let nuVal = [0, 0, 0, 0, 0, 0, 0];

        if (n < 128) {
            console.warn("Sequence is too short. A minimum length of 128 bit is needed.");
            return {
                name: this.longestRunOfOnesTest.name,
                pValue: 0.0,
                n: n,
                V: V,
                M: M,
                K: K,
                N: 0,
                chiSqr: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        if (n < 6272) {
            K = 3;
            M = 8;
            V = [1, 2, 3, 4];
            piVal = [0.21484375, 0.3671875, 0.23046875, 0.1875];
        } else if (n < 750000) {
            K = 5;
            M = 128;
            V = [4, 5, 6, 7, 8, 9];
            piVal = [0.1174035788, 0.242955959, 0.249363483, 0.17517706, 0.102701071, 0.112398847];
        } else {
            K = 6;
            M = 10000;
            V = [10, 11, 12, 13, 14, 15, 16];
            piVal = [0.0882, 0.2092, 0.2483, 0.1933, 0.1208, 0.0675, 0.0727];
        }

        let N = Math.trunc(n / M); // block count
        for (let i = 0; i < N; i++) {
            let maxRunInBlock = 0;
            let currentRun = 0;
            for (let j = 0; j < M; j++) {
                if (this.randomBinSequence[i * M + j] === 1) {
                    currentRun++;
                    if (currentRun > maxRunInBlock) {
                        maxRunInBlock = currentRun;
                    }
                } else {
                    currentRun = 0;
                }
            }
            if (maxRunInBlock < V[0]) {
                nuVal[0]++;
            }

            for (let j = 0; j < K + 1; j++) {
                if (maxRunInBlock === V[j]) {
                    nuVal[j]++;
                }
            }

            if (maxRunInBlock > V[K]) {
                nuVal[K]++;
            }
        }

        let chiSqr = 0;
        for (let i = 0; i < K + 1; i++) {
            chiSqr += Math.pow(nuVal[i] - N * piVal[i], 2) / (N * piVal[i]);
        }

        let pValue = MathFunc.igamc(K / 2, chiSqr / 2);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.longestRunOfOnesTest.name,
            pValue: pValue,
            n: n,
            V: V,
            M: M,
            K: K,
            N: N,
            chiSqr: chiSqr,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
