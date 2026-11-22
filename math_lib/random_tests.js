// Ported to JavaScript by Zsolt Molnar (https://mzsoltmolnar.github.io/)
// Based on NIST Statistical Test Suite ANSI C code:
// https://csrc.nist.gov/Projects/Random-Bit-Generation/Documentation-and-Software
//
// Core of the RandomTests class. Each test lives in its own file under
// math_lib/tests/ and is attached to RandomTests.prototype, mirroring the
// one-file-per-test structure of NIST STS (sts-2.1.2/src). This file must be
// loaded before the test files.

class RandomTests {
    constructor(sequenceArray) {
        this.randomBinSequence = sequenceArray.slice();
    }
}
