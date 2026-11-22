class SequencePreprocessor {
    // Longest bitstream accepted; longer inputs are truncated.
    static MAX_LENGTH = 10000000;

    preprocessedSequence = [];
    constructor(sequenceString) {
        for (let i = 0; i < sequenceString.length; i++) {
            if (sequenceString.charAt(i) === "0" || sequenceString.charAt(i) === "1") {
                this.preprocessedSequence.push(parseInt(sequenceString.charAt(i)));
                if (this.preprocessedSequence.length >= SequencePreprocessor.MAX_LENGTH) break;
            }
        }
    }

    get array() {
        return this.preprocessedSequence;
    }

    get sequenceString() {
        return this.preprocessedSequence.join("");
    }

    randomnessExtractor(sequenceString) {
        this.preprocessedSequence = [];
        for (let i = 0; i < sequenceString.length - 1; i += 2) {
            if (sequenceString.charAt(i) === "0" || sequenceString.charAt(i) === "1") {
                if (sequenceString.charAt(i) !== sequenceString.charAt(i + 1)) {
                    this.preprocessedSequence.push(parseInt(sequenceString.charAt(i)));
                    if (this.preprocessedSequence.length >= SequencePreprocessor.MAX_LENGTH) break;
                }
            }
        }
    }
}
