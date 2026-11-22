// NIST SP 800-22 Overlapping Template Matching Test
// Based on NIST STS src/overlappingTemplateMatchings.c

Object.assign(RandomTests.prototype, {
    overlappingTemplateMatchingTest() {
        let n = this.randomBinSequence.length;
        let m = 9; // 9 or 10 - NIST recommendation
        let epsilon = this.randomBinSequence;

        let i, k, match;
        let W_obs, eta, sum, chiSqr, pValue, lambda;
        let M, N, j, K = 5;
        let nu = [0, 0, 0, 0, 0, 0];
        let pi = [];
        let sequence = [];

        if (n < 1000000) {
            console.warn("Sequence is too short. A minimum length of 1000000 bit is needed.");
            return {
                name: this.overlappingTemplateMatchingTest.name,
                pValue: 0.0,
                n: n,
                M: 0,
                N: 0,
                chiSqr: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        M = 1032;
        N = Math.trunc(n / M);

        for (i = 0; i < m; i++) {
            sequence[i] = 1;
        }

        lambda = (M - m + 1) / Math.pow(2, m);
        eta = lambda / 2.0;
        sum = 0.0;
        for (i = 0; i < K; i++) {                       /* Compute Probabilities */
            pi[i] = this.Pr(i, eta);
            sum += pi[i];
        }
        pi[K] = 1 - sum;

        for (i = 0; i < N; i++) {
            W_obs = 0;
            for (j = 0; j < M - m + 1; j++) {
                match = 1;
                for (k = 0; k < m; k++) {
                    if (sequence[k] !== epsilon[i * M + j + k]) {
                        match = 0;
                        break;
                    }
                }
                if (match === 1) {
                    W_obs++;
                }
            }
            if (W_obs <= 4) {
                nu[W_obs]++;
            } else {
                nu[K]++;
            }
        }
        chiSqr = 0.0;                                   /* Compute Chi Square */
        for (i = 0; i < K + 1; i++) {
            chiSqr += Math.pow(nu[i] - N * pi[i], 2) / (N * pi[i]);
        }
        pValue = MathFunc.igamc(K / 2.0, chiSqr / 2.0);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.overlappingTemplateMatchingTest.name,
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
    },

    // needed for overlappingTemplateMatchingTest
    Pr(u, eta) {
        let l;
        let sum, p;

        if (u === 0) {
            p = Math.exp(-eta);
        } else {
            sum = 0.0;
            for (l = 1; l <= u; l++) {
                sum += Math.exp(-eta - u * Math.log(2) + l * Math.log(eta) - MathFunc.lgam(l + 1) + MathFunc.lgam(u) - MathFunc.lgam(l) - MathFunc.lgam(u - l + 1));
            }
            p = sum;
        }
        return p;
    }
});
