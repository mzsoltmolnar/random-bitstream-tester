// NIST SP 800-22 Binary Matrix Rank Test
// Based on NIST STS src/rank.c

Object.assign(RandomTests.prototype, {
    binaryMatrixRankTest() {
        let n = this.randomBinSequence.length;

        let N, i, k, r;
        let pValue, product, chiSqr, p_32, p_31, p_30, R, F_32, F_31, F_30;

        if (n < 38 * 32 * 32) {
            console.warn("Sequence is too short. A minimum length of 38912 bit is needed for this test.");
            return {
                name: this.binaryMatrixRankTest.name,
                pValue: 0.0,
                n: n,
                chiSqr: 0.0,
                N: 0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        let matrix = MatrixUtils.create_matrix(32, 32);
        N = Math.trunc(n / (32 * 32));

        r = 32;                                     /* COMPUTE PROBABILITIES */
        product = 1;
        for (i = 0; i <= r - 1; i++) {
            product *= ((1.e0 - Math.pow(2, i - 32)) * (1.e0 - Math.pow(2, i - 32))) / (1.e0 - Math.pow(2, i - r));
        }
        p_32 = Math.pow(2, r * (32 + 32 - r) - 32 * 32) * product;

        r = 31;
        product = 1;
        for (i = 0; i <= r - 1; i++) {
            product *= ((1.e0 - Math.pow(2, i - 32)) * (1.e0 - Math.pow(2, i - 32))) / (1.e0 - Math.pow(2, i - r));
        }
        p_31 = Math.pow(2, r * (32 + 32 - r) - 32 * 32) * product;

        p_30 = 1 - (p_32 + p_31);

        F_32 = 0;
        F_31 = 0;

        for (k = 0; k < N; k++) {                   /* FOR EACH 32x32 MATRIX */
            MatrixUtils.def_matrix(32, 32, matrix, k, this.randomBinSequence);

            R = MatrixUtils.computeRank(32, 32, matrix);
            if (R === 32) {                         /* DETERMINE FREQUENCIES */
                F_32++;
            }
            if (R === 31) {
                F_31++;
            }
        }
        F_30 = N - (F_32 + F_31);

        chiSqr = (Math.pow(F_32 - N * p_32, 2) / (N * p_32) +
            Math.pow(F_31 - N * p_31, 2) / (N * p_31) +
            Math.pow(F_30 - N * p_30, 2) / (N * p_30));

        pValue = Math.exp(-chiSqr / 2.e0);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.binaryMatrixRankTest.name,
            pValue: pValue,
            n: n,
            chiSqr: chiSqr,
            N: N,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
