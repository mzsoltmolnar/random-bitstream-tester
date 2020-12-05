class SequencePreprocessor {
    preprocessedSequence = [];
    constructor(sequenceString) {
        for (let i = 0; i < sequenceString.length; i++) {
            if (sequenceString.charAt(i) === "0" || sequenceString.charAt(i) === "1") {
                this.preprocessedSequence.push(parseInt(sequenceString.charAt(i)));
                if (this.preprocessedSequence.length >= 1000000) break;
            }
        }
    }

    get array() {
        return this.preprocessedSequence;
    }

    get sequenceString() {
        var string = "";
        for (let i = 0; i < this.preprocessedSequence.length; i++) {
            string = string.concat(this.preprocessedSequence[i].toString());
        }

        //  console.log(this.preprocessedSequence.length);
        // console.log(string);
        return string;
    }

    randomnessExtractor(sequenceString) {
        this.preprocessedSequence = [];
        for (let i = 0; i < sequenceString.length - 1; i += 2) {
            if (sequenceString.charAt(i) === "0" || sequenceString.charAt(i) === "1") {
                if (sequenceString.charAt(i) !== sequenceString.charAt(i + 1)) {
                    this.preprocessedSequence.push(parseInt(sequenceString.charAt(i)));
                    if (this.preprocessedSequence.length >= 1000000) break;
                }
            }
        }
    }
}