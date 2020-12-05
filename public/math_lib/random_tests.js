// Ported to JavaScript by Zsolt Molnar (https://mzsoltmolnar.github.io/)
// Based on NIST Statistical Test Suite ANSI C code:
// https://csrc.nist.gov/Projects/Random-Bit-Generation/Documentation-and-Software

class RandomTests {
    constructor(sequenceArray) {
        this.randomBinSequence = sequenceArray.slice();
    }

    // -------------------------------------------- frequencyTest
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

    // -------------------------------------------- frequencyTestBlock
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

        var piArray = [];
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

    // -------------------------------------------- runsTest
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
            }
        }

        let vObs = 1;
        for (let i = 1; i < n; i++) {
            if (this.randomBinSequence[i] !== this.randomBinSequence[i - 1]) {
                vObs++;
            }
        }
        let tempValue = (vObs - 2 * n * piObs * (1 - piObs)) / (2 * piObs * (1 - piObs) * Math.sqrt(2 * n));
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

    // -------------------------------------------- longestRunOfOnesTest
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

            V[0] = 1;
            V[1] = 2;
            V[2] = 3;
            V[3] = 4;

            piVal[0] = 0.21484375;
            piVal[1] = 0.3671875;
            piVal[2] = 0.23046875;
            piVal[3] = 0.1875;

        } else if (n < 750000) {
            K = 5;
            M = 128;

            V[0] = 4;
            V[1] = 5;
            V[2] = 6;
            V[3] = 7;
            V[4] = 8;
            V[5] = 9;

            piVal[0] = 0.1174035788;
            piVal[1] = 0.242955959;
            piVal[2] = 0.249363483;
            piVal[3] = 0.17517706;
            piVal[4] = 0.102701071;
            piVal[5] = 0.112398847;

        } else {
            K = 6;
            M = 10000;

            V[0] = 10;
            V[1] = 11;
            V[2] = 12;
            V[3] = 13;
            V[4] = 14;
            V[5] = 15;
            V[6] = 16;

            piVal[0] = 0.0882;
            piVal[1] = 0.2092;
            piVal[2] = 0.2483;
            piVal[3] = 0.1933;
            piVal[4] = 0.1208;
            piVal[5] = 0.0675;
            piVal[6] = 0.0727;
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

    // -------------------------------------------- binaryMatrixRankTest
    binaryMatrixRankTest() {
        let n = this.randomBinSequence.length;

        let N, i, k, r;
        let pValue, product, chiSqr, arg1, p_32, p_31, p_30, R, F_32, F_31, F_30;
        let matrix = MatrixUtils.create_matrix(32, 32);

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

        N = Math.trunc(n / (32 * 32));

        r = 32;					/* COMPUTE PROBABILITIES */
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

        for (k = 0; k < N; k++) {			/* FOR EACH 32x32 MATRIX   */
            MatrixUtils.def_matrix(32, 32, matrix, k, this.randomBinSequence);

            R = MatrixUtils.computeRank(32, 32, matrix);
            if (R === 32) {
                F_32++;
            }		/* DETERMINE FREQUENCIES */
            if (R === 31) {
                F_31++;
            }
        }
        F_30 = N - (F_32 + F_31);

        chiSqr = (Math.pow(F_32 - N * p_32, 2) / (N * p_32) +
            Math.pow(F_31 - N * p_31, 2) / (N * p_31) +
            Math.pow(F_30 - N * p_30, 2) / (N * p_30));

        arg1 = -chiSqr / 2.e0;

        pValue = Math.exp(arg1);

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

    // -------------------------------------------- dftSpectralTest
    // dftSpectralTest() {
    //     let pValue, upperBound, percentile, N_l, N_o, d, * m = NULL, X = [], * wsave = NULL;
    //     let i, count, ifac[15];

    //     if (((X = (double *) calloc(n, sizeof(double))) == NULL) ||
    //         ((wsave = (double *)calloc(2 * n, sizeof(double))) == NULL) ||
    //             ((m = (double *)calloc(n / 2 + 1, sizeof(double))) == NULL) ) {
    //         fprintf(stats[7], "\t\tUnable to allocate working arrays for the DFT.\n");
    //         if (X !== NULL)
    //             free(X);
    //         if (wsave !== NULL)
    //             free(wsave);
    //         if (m !== NULL)
    //             free(m);
    //         return;
    //     }
    //     for (i = 0; i < n; i++)
    //         X[i] = 2 * (int)epsilon[i] - 1;

    //     __ogg_fdrffti(n, wsave, ifac);		/* INITIALIZE WORK ARRAYS */
    //     __ogg_fdrfftf(n, X, wsave, ifac);	/* APPLY FORWARD FFT */

    //     m[0] = sqrt(X[0] * X[0]);	    /* COMPUTE MAGNITUDE */

    //     for (i = 0; i < n / 2; i++)
    //         m[i + 1] = sqrt(pow(X[2 * i + 1], 2) + pow(X[2 * i + 2], 2));
    //     count = 0;				       /* CONFIDENCE INTERVAL */
    //     upperBound = sqrt(2.995732274 * n);
    //     for (i = 0; i < n / 2; i++)
    //         if (m[i] < upperBound)
    //             count++;
    //     percentile = (double)count / (n / 2) * 100;
    //     N_l = (double) count;       /* number of peaks less than h = sqrt(3*n) */
    //     N_o = (double) 0.95 * n / 2.0;
    //     d = (N_l - N_o) / sqrt(n / 4.0 * 0.95 * 0.05);
    //     pValue = erfc(fabs(d) / sqrt(2.0));

    //     fprintf(stats[TEST_FFT], "\t\t\t\tFFT TEST\n");
    //     fprintf(stats[TEST_FFT], "\t\t-------------------------------------------\n");
    //     fprintf(stats[TEST_FFT], "\t\tCOMPUTATIONAL INFORMATION:\n");
    //     fprintf(stats[TEST_FFT], "\t\t-------------------------------------------\n");
    //     fprintf(stats[TEST_FFT], "\t\t(a) Percentile = %f\n", percentile);
    //     fprintf(stats[TEST_FFT], "\t\t(b) N_l        = %f\n", N_l);
    //     fprintf(stats[TEST_FFT], "\t\t(c) N_o        = %f\n", N_o);
    //     fprintf(stats[TEST_FFT], "\t\t(d) d          = %f\n", d);
    //     fprintf(stats[TEST_FFT], "\t\t-------------------------------------------\n");

    //     fprintf(stats[TEST_FFT], "%s\t\tp_value = %f\n\n", pValue < ALPHA ? "FAILURE" : "SUCCESS", pValue);
    //     fprintf(results[TEST_FFT], "%f\n", pValue);

    //     free(X);
    //     free(wsave);
    //     free(m);


    //     result = {
    //         name: this.dftSpectralTest.name,
    //         pValue: pValue,
    //         n: n,
    //         chiSqr: chiSqr
    //     };
    //     console.log(result);
    //     return result;
    // }

    // -------------------------------------------- OverlappingTemplateMatchingTest
    nonOverlappingTemplateMatchingsTest() {
        let n = this.randomBinSequence.length;
        let m = 9; // 9 or 10 - NIST recommendation
        let epsilon = this.randomBinSequence;

        let numOfTemplates = [0, 0, 2, 4, 6, 12, 20, 40, 74, 148, 284, 568, 1116,
            2232, 4424, 8848, 17622, 35244, 70340, 140680, 281076, 562152];
        let MAX_NUM_OF_TEMPLATES = 562153;
        /*----------------------------------------------------------------------------
        NOTE:  Should additional templates lengths beyond 21 be desired, they must 
        first be constructed, saved into files and then the corresponding 
        number of nonperiodic templates for that file be stored in the m-th 
        position in the numOfTemplates variable.
        ----------------------------------------------------------------------------*/
        let bit, W_obs, nu = [], Wj = [];
        let sum, chiSqr, pValue, lambda, pi = [], varWj;
        let i, j, jj, k, match, SKIP, M, N, K = 5;
        let sequence = [];

        if (n < 1000000) {
            console.warn("Sequence is too short. A minimum length of 1000000 bit is needed for this test.");
            return {
                name: this.nonOverlappingTemplateMatchingsTest.name,
                pValue: 0.0,
                n: n,
                M: 0,
                N: 0,
                jj: 0,
                chiSqr: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        N = 8;
        M = Math.trunc(n / N);

        lambda = (M - m + 1) / Math.pow(2, m);
        varWj = M * (1.0 / Math.pow(2.0, m) - (2.0 * m - 1.0) / Math.pow(2.0, 2.0 * m));

        if (lambda <= 0) {
            console.warn("nonOverlappingTemplateMatchingsTest aborted because lambda is not positive");
            return {
                name: this.nonOverlappingTemplateMatchingsTest.name,
                pValue: 0.0,
                n: n,
                M: M,
                N: N,
                jj: 0,
                chiSqr: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        } else {

            if (numOfTemplates[m] < MAX_NUM_OF_TEMPLATES) {
                SKIP = 1;
            }
            else {
                SKIP = (numOfTemplates[m] / MAX_NUM_OF_TEMPLATES);
            }
            numOfTemplates[m] = numOfTemplates[m] / SKIP;

            sum = 0.0;
            for (i = 0; i < 2; i++) {                      /* Compute Probabilities */
                pi[i] = Math.exp(-lambda + i * Math.log(lambda) - MathFunc.lgam(i + 1));
                sum += pi[i];
            }
            pi[0] = sum;
            for (i = 2; i <= K; i++) {                      /* Compute Probabilities */
                pi[i - 1] = Math.exp(-lambda + i * Math.log(lambda) - MathFunc.lgam(i + 1));
                sum += pi[i - 1];
            }
            pi[K] = 1 - sum;

            for (jj = 0; jj < Math.min(MAX_NUM_OF_TEMPLATES, numOfTemplates[m]); jj++) {
                sum = 0;

                for (k = 0; k < m; k++) {
                    if (m === 9) { bit = MatchTemplates.template_9[jj][k]; }
                    if (m === 10) { bit = MatchTemplates.template_10[jj][k]; }
                    sequence[k] = bit;
                }

                for (k = 0; k <= K; k++)
                    nu[k] = 0;
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
                            j += m - 1;
                        }
                    }
                    Wj[i] = W_obs;
                }
                sum = 0;
                chiSqr = 0.0;                                   /* Compute Chi Square */
                for (i = 0; i < N; i++) {
                    chiSqr += Math.pow((Wj[i] - lambda) / Math.pow(varWj, 0.5), 2);
                }
                pValue = MathFunc.igamc(N / 2.0, chiSqr / 2.0);
            }
        }

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.nonOverlappingTemplateMatchingsTest.name,
            pValue: pValue,
            n: n,
            M: M,
            N: N,
            jj: jj,
            chiSqr: chiSqr,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }

    // -------------------------------------------- OverlappingTemplateMatchingTest
    overlappingTemplateMatchingTest() {
        let n = this.randomBinSequence.length;
        let m = 9; // 9 or 10 - NIST recommendation
        let epsilon = this.randomBinSequence;

        let i, k, match;
        let W_obs, eta, sum, chiSqr, pValue, lambda;
        let M, N, j, K = 5;
        let nu = [0, 0, 0, 0, 0, 0];
        //let pi = [0.143783, 0.139430, 0.137319, 0.124314, 0.106209, 0.348945];
        let pi = [0.364091, 0.185659, 0.139381, 0.100571, 0.0704323, 0.139865];
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
        for (i = 0; i < K; i++) {			/* Compute Probabilities */
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
                    }
                }
                if (match === 1) {
                    W_obs++;
                }
            }
            if (W_obs <= 4) {
                nu[W_obs]++;
            }
            else {
                nu[K]++;
            }
        }
        sum = 0;
        chiSqr = 0.0;                                   /* Compute Chi Square */
        for (i = 0; i < K + 1; i++) {
            chiSqr += Math.pow(nu[i] - N * pi[i], 2) / (N * pi[i]);
            sum += nu[i];
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
    }

    // needed for the previous OverlappingTemplateMatchingTest function
    Pr(u, eta) {
        let l;
        let sum, p;

        if (u === 0) {
            p = Math.exp(-eta);
        }
        else {
            sum = 0.0;
            for (l = 1; l <= u; l++) {
                sum += Math.exp(-eta - u * Math.log(2) + l * Math.log(eta) - MathFunc.lgam(l + 1) + MathFunc.lgam(u) - MathFunc.lgam(l) - MathFunc.lgam(u - l + 1));
            }
            p = sum;
        }
        return p;
    }

    // -------------------------------------------- universalMaurerTest
    universalMaurerTest() {
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;

        let i, j, p, L, Q, K;
        let arg, sqrt2, sigma, phi, sum, pValue, c;
        let T = [], decRep;
        let expected_value = [0, 0, 0, 0, 0, 0, 5.2177052, 6.1962507, 7.1836656, 8.1764248, 9.1723243, 10.170032, 11.168765, 12.168070, 13.167693, 14.167488, 15.167379];
        let variance = [0, 0, 0, 0, 0, 0, 2.954, 3.125, 3.238, 3.311, 3.356, 3.384, 3.401, 3.410, 3.416, 3.419, 3.421];

        /* * * * * * * * * ** * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * THE FOLLOWING REDEFINES L, SHOULD THE CONDITION:     n >= 1010*2^L*L       *
         * NOT BE MET, FOR THE BLOCK LENGTH L.                                        *
         * * * * * * * * * * ** * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        if (n < 387840) {
            console.warn("Sequence is too short. A minimum length of 387840 bit is needed.");
            return {
                name: this.universalMaurerTest.name,
                pValue: 0.0,
                n: n,
                L: 0,
                Q: 0,
                K: 0,
                sum: 0.0,
                sigma: 0.0,
                variance: 0.0,
                expected_value: 0.0,
                phi: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        L = 5;
        if (n >= 387840) L = 6;
        if (n >= 904960) L = 7;
        if (n >= 2068480) L = 8;
        if (n >= 4654080) L = 9;
        if (n >= 10342400) L = 10;
        if (n >= 22753280) L = 11;
        if (n >= 49643520) L = 12;
        if (n >= 107560960) L = 13;
        if (n >= 231669760) L = 14;
        if (n >= 496435200) L = 15;
        if (n >= 1059061760) L = 16;

        Q = 10 * Math.pow(2, L);
        K = Math.trunc(n / L) - Q;	 		    /* BLOCKS TO TEST */

        p = Math.pow(2, L);
        if (L < 6 || L > 16 || Q < 10 * Math.pow(2, L)) {
            console.warn("L is out of range or Q < 10 * Math.pow(2, L)");
            return {
                name: this.universalMaurerTest.name,
                pValue: 0.0,
                n: n,
                L: L,
                Q: Q,
                K: K,
                sum: 0.0,
                sigma: 0.0,
                variance: 0.0,
                expected_value: 0.0,
                phi: 0.0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        /* COMPUTE THE EXPECTED:  Formula 16, in Marsaglia's Paper */
        c = 0.7 - 0.8 / L + (4 + 32 / L) * Math.pow(K, -3 / L) / 15;
        sigma = c * Math.sqrt(variance[L] / K);
        sqrt2 = Math.sqrt(2);
        sum = 0.0;
        for (i = 0; i < p; i++) {
            T[i] = 0;
        }
        for (i = 1; i <= Q; i++) {		/* INITIALIZE TABLE */
            decRep = 0;
            for (j = 0; j < L; j++) {
                decRep += epsilon[(i - 1) * L + j] * Math.pow(2, L - 1 - j);
            }
            T[decRep] = i;
        }
        for (i = Q + 1; i <= Q + K; i++) { 	/* PROCESS BLOCKS */
            decRep = 0;
            for (j = 0; j < L; j++) {
                decRep += epsilon[(i - 1) * L + j] * Math.pow(2, L - 1 - j);
            }
            sum += Math.log(i - T[decRep]) / Math.log(2);
            T[decRep] = i;
        }
        phi = sum / K;

        arg = Math.abs(phi - expected_value[L]) / (sqrt2 * sigma);
        pValue = MathFunc.erfc(arg);

        let pValueOutOfRange = false;
        if (pValue < 0 || pValue > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.universalMaurerTest.name,
            pValue: pValue,
            n: n,
            L: L,
            Q: Q,
            K: K,
            sum: sum,
            sigma: sigma,
            variance: variance[L],
            expected_value: expected_value[L],
            phi: phi,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }

    // -------------------------------------------- linearComplexityTest
    linearComplexityTest() {
        let n = this.randomBinSequence.length;
        let m = 9; // 9 or 10 - NIST recommendation
        let epsilon = this.randomBinSequence;

        let i, ii, j, d, N, L, N_, parity, sign, K = 6;
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

        let M = 1000;
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

            /* DETERMINE LINEAR COMPLEXITY */
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
            if ((parity = (M + 1) % 2) === 0) {
                sign = -1;
            } else {
                sign = 1;
            }
            mean = M / 2.0 + (9.0 + sign) / 36.0 - 1.0 / Math.pow(2, M) * (M / 3.0 + 2.0 / 9.0);
            if ((parity = M % 2) === 0) {
                sign = 1;
            } else {
                sign = -1;
            }
            T_ = sign * (L - mean) + 2.0 / 9.0;

            if (T_ <= -2.5) {
                nu[0]++;
            } else if (T_ > -2.5 && T_ <= -1.5) {
                nu[1]++;
            } else if (T_ > -1.5 && T_ <= -0.5) {
                nu[2]++;
            } else if (T_ > -0.5 && T_ <= 0.5) {
                nu[3]++;
            } else if (T_ > 0.5 && T_ <= 1.5) {
                nu[4]++;
            } else if (T_ > 1.5 && T_ <= 2.5) {
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

    // -------------------------------------------- serialTest
    serialTest() {
        let n = this.randomBinSequence.length;
        let m = 2;
        let epsilon = this.randomBinSequence;

        let pValue1, pValue2, psim0, psim1, psim2, del1, del2;

        if (n < 1000000) {
            console.warn("Sequence is too short. A minimum length of 1000000 bit is needed.");
            return {
                name: this.serialTest.name,
                pValue1: 0.0,
                pValue2: 0.0,
                n: n,
                m: m,
                pValueOutOfRange: false,
                isError: true
            };
        }

        psim0 = this.psi2(m, n, epsilon);
        psim1 = this.psi2(m - 1, n, epsilon);
        psim2 = this.psi2(m - 2, n, epsilon);
        del1 = psim0 - psim1;
        del2 = psim0 - 2.0 * psim1 + psim2;
        pValue1 = MathFunc.igamc(Math.pow(2, m - 1) / 2, del1 / 2.0);
        pValue2 = MathFunc.igamc(Math.pow(2, m - 2) / 2, del2 / 2.0);

        let pValueOutOfRange = false;
        if (pValue1 < 0 || pValue1 > 1) {
            pValueOutOfRange = true;
        }

        if (pValue2 < 0 || pValue2 > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.serialTest.name,
            pValue1: pValue1,
            pValue2: pValue2,
            n: n,
            m: m,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }

    // -------------------------------------------- Required for serialTest
    psi2(m, n, epsilon) {
        let i, j, k, powLen;
        let sum, numOfBlocks;
        let P = [];

        if ((m === 0) || (m === -1)) {
            return 0.0;
        }
        numOfBlocks = n;
        powLen = Math.trunc(Math.pow(2, m + 1)) - 1;

        for (i = 1; i < powLen; i++) {
            P[i] = 0;	  /* INITIALIZE NODES */
        }

        for (i = 0; i < numOfBlocks; i++) {		 /* COMPUTE FREQUENCY */
            k = 1;
            for (j = 0; j < m; j++) {
                if (epsilon[(i + j) % n] === 0) {
                    k *= 2;
                } else if (epsilon[(i + j) % n] === 1) {
                    k = 2 * k + 1;
                }
            }
            P[k - 1]++;
        }

        sum = 0.0;
        for (i = Math.trunc(Math.pow(2, m)) - 1; i < Math.trunc(Math.pow(2, m + 1)) - 1; i++) {
            sum += Math.pow(P[i], 2);
        }
        sum = (sum * Math.pow(2, m) / n) - n;

        return sum;
    }

    // -------------------------------------------- approximateEntropyTest
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
            }
            else {
                numOfBlocks = seqLength;
                powLen = Math.trunc(Math.pow(2, blockSize + 1)) - 1;

                for (i = 1; i < powLen; i++) {
                    P[i] = 0;
                }

                for (i = 0; i < numOfBlocks; i++) { /* COMPUTE FREQUENCY */
                    k = 1;
                    for (j = 0; j < blockSize; j++) {
                        k *= 2; // k <<= 1;
                        if (epsilon[(i + j) % seqLength] === 1) {
                            k++;
                        }
                    }
                    P[k - 1]++;
                }
                /* DISPLAY FREQUENCY */
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

    // -------------------------------------------- cumulativeSumsTest
    cumulativeSumsTest() {
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;

        let S, sup, inf, z, zrev, k;
        let sum1, sum2, pValueFWD, pValueREV;

        if (n < 100) {
            console.warn("Sequence is too short. A minimum length of 100 bit is needed.");
            return {
                name: this.cumulativeSumsTest.name,
                pValueFWD: 0.0,
                pValueREV: 0.0,
                n: n,
                z: 0,
                zrev: 0,
                pValueOutOfRange: false,
                isError: true
            };
        }

        S = 0;
        sup = 0;
        inf = 0;
        for (k = 0; k < n; k++) {
            epsilon[k] ? S++ : S--;
            if (S > sup) {
                sup++;
            }
            if (S < inf) {
                inf--;
            }
            z = (sup > -inf) ? sup : -inf;
            zrev = (sup - S > S - inf) ? sup - S : S - inf;
        }

        // forward
        sum1 = 0.0;
        for (k = Math.trunc((Math.trunc(-n / z) + 1) / 4); k <= Math.trunc((Math.trunc(n / z) - 1) / 4); k++) {
            sum1 += MathFunc.normal(((4 * k + 1) * z) / Math.sqrt(n));
            sum1 -= MathFunc.normal(((4 * k - 1) * z) / Math.sqrt(n));
        }
        sum2 = 0.0;
        for (k = Math.trunc((Math.trunc(-n / z) - 3) / 4); k <= Math.trunc((Math.trunc(n / z) - 1) / 4); k++) {
            sum2 += MathFunc.normal(((4 * k + 3) * z) / Math.sqrt(n));
            sum2 -= MathFunc.normal(((4 * k + 1) * z) / Math.sqrt(n));
        }

        pValueFWD = 1.0 - sum1 + sum2;

        // backwards
        sum1 = 0.0;
        for (k = Math.trunc((Math.trunc(-n / zrev) + 1) / 4); k <= Math.trunc((Math.trunc(n / zrev) - 1) / 4); k++) {
            sum1 += MathFunc.normal(((4 * k + 1) * zrev) / Math.sqrt(n));
            sum1 -= MathFunc.normal(((4 * k - 1) * zrev) / Math.sqrt(n));
        }
        sum2 = 0.0;
        for (k = Math.trunc((Math.trunc(-n / zrev)) - 3) / 4; k <= Math.trunc((Math.trunc(n / zrev) - 1) / 4); k++) {
            sum2 += MathFunc.normal(((4 * k + 3) * zrev) / Math.sqrt(n));
            sum2 -= MathFunc.normal(((4 * k + 1) * zrev) / Math.sqrt(n));
        }

        pValueREV = 1.0 - sum1 + sum2;

        let pValueOutOfRange = false;
        if (pValueFWD < 0 || pValueFWD > 1) {
            pValueOutOfRange = true;
        }

        if (pValueREV < 0 || pValueREV > 1) {
            pValueOutOfRange = true;
        }
        let result = {
            name: this.cumulativeSumsTest.name,
            pValueFWD: pValueFWD,
            pValueREV: pValueREV,
            n: n,
            z: z,
            zrev: zrev,
            pValueOutOfRange: pValueOutOfRange,
            isError: false
        };
        console.log(result);
        return result;
    }

    // -------------------------------------------- randomExcursionsTest
    randomExcursionsTest() {
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;
        var pValueOutOfRange = false;

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


        J = 0; 					/* DETERMINE CYCLES */
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
        else {
            cycleStart = 0;
            cycleStop = cycle[1];
            for (k = 0; k < 6; k++)
                for (i = 0; i < 8; i++)
                    nu[k][i] = 0.;
            for (j = 1; j <= J; j++) {                           /* FOR EACH CYCLE */
                for (i = 0; i < 8; i++)
                    counter[i] = 0;
                for (i = cycleStart; i < cycleStop; i++) {
                    if ((S_k[i] >= 1 && S_k[i] <= 4) || (S_k[i] >= -4 && S_k[i] <= -1)) {
                        if (S_k[i] < 0)
                            b = 4;
                        else
                            b = 3;
                        counter[S_k[i] + b]++;
                    }
                }
                cycleStart = cycle[j] + 1;
                if (j < J)
                    cycleStop = cycle[j + 1];

                for (i = 0; i < 8; i++) {
                    if ((counter[i] >= 0) && (counter[i] <= 4))
                        nu[counter[i]][i]++;
                    else if (counter[i] >= 5)
                        nu[5][i]++;
                }
            }

            for (i = 0; i < 8; i++) {
                x = stateX[i];
                sum = 0.;
                for (k = 0; k < 6; k++)
                    sum += Math.pow(nu[k][i] - J * pi[Math.trunc(Math.abs(x))][k], 2) / (J * pi[Math.trunc(Math.abs(x))][k]);
                pValue[i] = MathFunc.igamc(2.5, sum / 2.0);

                if (pValue[i] < 0 || pValue[i] > 1) {
                    pValueOutOfRange = true;
                }
            }
        }

        let minPValue = Infinity
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

    // -------------------------------------------- randomExcursionsVariantTest
    randomExcursionsVariantTest() { // MATCHES THE RESULTS PROVIDED
        let n = this.randomBinSequence.length;
        let epsilon = this.randomBinSequence;
        let pValueOutOfRange = false;

        let i, p, J, x, constraint, count, S_k = [];
        let stateX = [- 9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
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
            if (S_k[i] === 0)
                J++;
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
        else {
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
        }

        let minPValue = Infinity
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
}

