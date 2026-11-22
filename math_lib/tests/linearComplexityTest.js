// NIST SP 800-22 Linear Complexity Test
// Based on NIST STS src/linearComplexity.c

Object.assign(RandomTests.prototype, {
    linearComplexityTest() {
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;

        let i, ii, j, d, m, N, L, N_, sign, K = 6;
        let pValue, T_, mean, nu = [], chiSqr;
        let pi = [0.01047, 0.03125, 0.12500, 0.50000, 0.25000, 0.06250, 0.020833];
        let T = [], P = [], B_ = [], C = [];

        if (n < 1000000) {
            console.warn("Sequence is too short. A minimum length of 1000000 bit is needed.");
            return {
                name: this.linearComplexityTest.name,
                pValue: 0.0,
                n: n,
                M: 0,
                chiSqr: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        let M = 1000; // block size
        N = Math.trunc(n / M);

        for (i = 0; i < K + 1; i++) {
            nu[i] = 0.00;
        }
        for (ii = 0; ii < N; ii++) {
            for (i = 0; i < M; i++) {
                B_[i] = 0;
                C[i] = 0;
                T[i] = 0;
                P[i] = 0;
            }

            L = 0;
            m = -1;
            d = 0;
            C[0] = 1;
            B_[0] = 1;

            /* DETERMINE LINEAR COMPLEXITY (Berlekamp-Massey) */
            N_ = 0;
            while (N_ < M) {
                d = epsilon[ii * M + N_];
                for (i = 1; i <= L; i++) {
                    d += C[i] * epsilon[ii * M + N_ - i];
                }
                d = d % 2;
                if (d === 1) {
                    for (i = 0; i < M; i++) {
                        T[i] = C[i];
                        P[i] = 0;
                    }
                    for (j = 0; j < M; j++) {
                        if (B_[j] === 1) {
                            P[j + N_ - m] = 1;
                        }
                    }
                    for (i = 0; i < M; i++) {
                        C[i] = (C[i] + P[i]) % 2;
                    }
                    if (L <= N_ / 2) {
                        L = N_ + 1 - L;
                        m = N_;
                        for (i = 0; i < M; i++) {
                            B_[i] = T[i];
                        }
                    }
                }
                N_++;
            }
            sign = ((M + 1) % 2 === 0) ? -1 : 1;
            mean = M / 2.0 + (9.0 + sign) / 36.0 - 1.0 / Math.pow(2, M) * (M / 3.0 + 2.0 / 9.0);
            sign = (M % 2 === 0) ? 1 : -1;
            T_ = sign * (L - mean) + 2.0 / 9.0;

            if (T_ <= -2.5) {
                nu[0]++;
            } else if (T_ <= -1.5) {
                nu[1]++;
            } else if (T_ <= -0.5) {
                nu[2]++;
            } else if (T_ <= 0.5) {
                nu[3]++;
            } else if (T_ <= 1.5) {
                nu[4]++;
            } else if (T_ <= 2.5) {
                nu[5]++;
            } else {
                nu[6]++;
            }
        }

        chiSqr = 0.00;
        for (i = 0; i < K + 1; i++) {
            chiSqr += Math.pow(nu[i] - N * pi[i], 2) / (N * pi[i]);
        }
        pValue = MathFunc.igamc(K / 2.0, chiSqr / 2.0);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.linearComplexityTest.name,
            pValue: pValue,
            n: n,
            M: M,
            chiSqr: chiSqr,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }
});
