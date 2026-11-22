// NIST SP 800-22 Non-overlapping Template Matching Test
// Based on NIST STS src/nonOverlappingTemplateMatchings.c
//
// Runs one test per aperiodic template of length m (148 templates for m = 9), like NIST STS.
// pValue and chiSqr hold one entry per template, in the order of the NIST template file.

Object.assign(RandomTests.prototype, {
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
        let W_obs, Wj = [];
        let chiSqr = [], pValue = [], lambda, varWj;
        let i, j, jj, k, match, SKIP, M, N;
        let sequence = [];

        if (n < 1000000) {
            console.warn("Sequence is too short. A minimum length of 1000000 bit is needed for this test.");
            return {
                name: this.nonOverlappingTemplateMatchingsTest.name,
                pValue: [],
                minPValue: 0.0,
                numOfTemplates: 0,
                n: n,
                M: 0,
                N: 0,
                chiSqr: [],
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
                pValue: [],
                minPValue: 0.0,
                numOfTemplates: 0,
                n: n,
                M: M,
                N: N,
                chiSqr: [],
                pValueOutOfRange: false,
                isError: true
            };
        }

        if (numOfTemplates[m] < MAX_NUM_OF_TEMPLATES) {
            SKIP = 1;
        } else {
            SKIP = (numOfTemplates[m] / MAX_NUM_OF_TEMPLATES);
        }
        numOfTemplates[m] = numOfTemplates[m] / SKIP;

        let templates = (m === 9) ? MatchTemplates.template_9 : MatchTemplates.template_10;

        for (jj = 0; jj < Math.min(MAX_NUM_OF_TEMPLATES, numOfTemplates[m]); jj++) {
            for (k = 0; k < m; k++) {
                sequence[k] = templates[jj][k];
            }

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
            chiSqr[jj] = 0.0;                               /* Compute Chi Square */
            for (i = 0; i < N; i++) {
                chiSqr[jj] += Math.pow((Wj[i] - lambda) / Math.pow(varWj, 0.5), 2);
            }
            pValue[jj] = MathFunc.igamc(N / 2.0, chiSqr[jj] / 2.0);
        }

        let pValueOutOfRange = false;
        let minPValue = Infinity;
        for (i = 0; i < pValue.length; i++) {
            if (pValue[i] < 0 || pValue[i] > 1) {
                pValueOutOfRange = true;
            }
            if (pValue[i] < minPValue) {
                minPValue = pValue[i];
            }
        }
        let result = {
            name: this.nonOverlappingTemplateMatchingsTest.name,
            pValue: pValue,
            minPValue: minPValue,
            numOfTemplates: pValue.length,
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
