$("#radRNG").change(bitstreamInputChanged);
$("#adcRNG").change(bitstreamInputChanged);
$("#pseudoRNG").change(bitstreamInputChanged);
$("#fileRNG").change(bitstreamInputChanged);
$("#manualRNG").change(bitstreamInputChanged);

$("#copyBitstreamToClipboard").on("click", copyBitstreamToClipboard);

$("#insertRadRandNum").on("click", insertRadRandNum);
$("#insertAdcRandNum").on("click", insertAdcRandNum);
$("#generateRandNum").on("click", generateRandNum);
$("#LoadFromFileConfirm").on("click", loadFromFile);
$("#insertManualInput").on("click", insertManualInput);

$("#startTest").on("click", startTests);

$("#generateRandNum").on("click", generateRandNum);

var preprocessor = new SequencePreprocessor("");

var selectedInput = "";

function insertRadRandNum() {
    resetInputStreamIndicator();
    resetTestIndicators();
    preprocessor = new SequencePreprocessor(RandomStringsData.randomRADString);
    $("#pureInputBits").html(preprocessor.sequenceString);
}

function insertAdcRandNum() {
    resetInputStreamIndicator();
    resetTestIndicators();
    preprocessor = new SequencePreprocessor(RandomStringsData.randomADCString);
    $("#pureInputBits").html(preprocessor.sequenceString);
}

function generateRandNum() {
    resetInputStreamIndicator();
    resetTestIndicators();
    let randString = "";
    for (let i = 0; i < 1000000; i++) {
        if (Math.random() < 0.5) {
            randString = randString.concat("0");
        } else {
            randString = randString.concat("1");
        }
    }
    preprocessor = new SequencePreprocessor(randString);
    $("#pureInputBits").html(preprocessor.sequenceString);
}

function loadFromFile() {
    var reader = new FileReader();
    
    console.log("loadFromFile");
    resetInputStreamIndicator();
    resetTestIndicators();
    
    reader.onload = function (e) {
        console.log("onload");
        var contents = e.target.result;
        preprocessor = new SequencePreprocessor(contents);
        $("#pureInputBits").html(preprocessor.sequenceString);
    }

    
    let file = $("#LoadFromFile").prop('files')[0];
    reader.readAsText(file);
    console.log(file);

}


function insertManualInput() {
    resetInputStreamIndicator();
    resetTestIndicators();
    let inputText = $("#manualRandNumbersText").val();

    preprocessor = new SequencePreprocessor(inputText);
    // preprocessor = new SequencePreprocessor("");
    // preprocessor.randomnessExtractor(inputText);

    $("#pureInputBits").html(preprocessor.sequenceString);
}

function startTests() {
    resetTestIndicators();
    executeTests(preprocessor.array);
}

function bitstreamInputChanged() {
    resetInputStreamIndicator();
    resetTestIndicators();
    selectedInput = $("input[name='bitstreamInput']:checked").val();

    if (selectedInput === "radRNG") {
        $("#insertRadRNGCollapse").show(250);
    } else {
        $("#insertRadRNGCollapse").hide(250);
    }

    if (selectedInput === "adcRNG") {
        $("#insertAdcRNGCollapse").show(250);
    } else {
        $("#insertAdcRNGCollapse").hide(250);
    }

    if (selectedInput === "pseudoRNG") {
        $("#pseudoRNGCollapse").show(250);
    } else {
        $("#pseudoRNGCollapse").hide(250);
    }

    if (selectedInput === "fileRNG") {
        $("#LoadFromFileCollapse").show(250);
    } else {
        $("#LoadFromFileCollapse").hide(250);
    }

    if (selectedInput === "manualRNG") {
        $("#manualRandNumbersTextCollapse").show(250);
    } else {
        $("#manualRandNumbersTextCollapse").hide(250);
    }
}

function copyBitstreamToClipboard() {
    copyToClipboard("pureInputBits");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeTests(array) {
    let randTest = new RandomTests(array);
    let threshold = 0.01;
    let stopIfFailed = false;
    let stopIfError = false;
    let failedTestCount = 0;

    let test_1_res = randTest.frequencyTest();
    if (test_1_res.isError) {
        setBadgeError("test_1_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_1_value", test_1_res.pValue);
        if (test_1_res.pValue >= threshold && test_1_res.pValue <= 1 && !test_1_res.pValueOutOfRange) {
            setBadgePassed("test_1_indicator");
        } else {
            setBadgeFailed("test_1_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_2_res = randTest.frequencyTestBlock();
    if (test_2_res.isError) {
        setBadgeError("test_2_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_2_value", test_2_res.pValue);
        if (test_2_res.pValue >= threshold && test_2_res.pValue <= 1 && !test_2_res.pValueOutOfRange) {
            setBadgePassed("test_2_indicator");
        } else {
            setBadgeFailed("test_2_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_3_res = randTest.runsTest();
    if (test_3_res.isError) {
        setBadgeError("test_3_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_3_value", test_3_res.pValue);
        if (test_3_res.pValue >= threshold && test_3_res.pValue <= 1 && !test_3_res.pValueOutOfRange) {
            setBadgePassed("test_3_indicator");
        } else {
            setBadgeFailed("test_3_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_4_res = randTest.longestRunOfOnesTest();
    if (test_4_res.isError) {
        setBadgeError("test_4_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_4_value", test_4_res.pValue);
        if (test_4_res.pValue >= threshold && test_4_res.pValue <= 1 && !test_4_res.pValueOutOfRange) {
            setBadgePassed("test_4_indicator");
        } else {
            setBadgeFailed("test_4_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_5_res = randTest.binaryMatrixRankTest();
    if (test_5_res.isError) {
        setBadgeError("test_5_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_5_value", test_5_res.pValue);
        if (test_5_res.pValue >= threshold && test_5_res.pValue <= 1 && !test_5_res.pValueOutOfRange) {
            setBadgePassed("test_5_indicator");
        } else {
            setBadgeFailed("test_5_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_6_res = randTest.nonOverlappingTemplateMatchingsTest();
    if (test_6_res.isError) {
        setBadgeError("test_6_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_6_value", test_6_res.pValue);
        if (test_6_res.pValue >= threshold && test_6_res.pValue <= 1 && !test_6_res.pValueOutOfRange) {
            setBadgePassed("test_6_indicator");
        } else {
            setBadgeFailed("test_6_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_7_res = randTest.overlappingTemplateMatchingTest();
    if (test_7_res.isError) {
        setBadgeError("test_7_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_7_value", test_7_res.pValue);
        if (test_7_res.pValue >= threshold && test_7_res.pValue <= 1 && !test_7_res.pValueOutOfRange) {
            setBadgePassed("test_7_indicator");
        } else {
            setBadgeFailed("test_7_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_8_res = randTest.universalMaurerTest();
    if (test_8_res.isError) {
        setBadgeError("test_8_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_8_value", test_8_res.pValue);
        if (test_8_res.pValue >= threshold && test_8_res.pValue <= 1 && !test_8_res.pValueOutOfRange) {
            setBadgePassed("test_8_indicator");
        } else {
            setBadgeFailed("test_8_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_9_res = randTest.linearComplexityTest();
    if (test_9_res.isError) {
        setBadgeError("test_9_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_9_value", test_9_res.pValue);
        if (test_9_res.pValue >= threshold && test_9_res.pValue <= 1 && !test_9_res.pValueOutOfRange) {
            setBadgePassed("test_9_indicator");
        } else {
            setBadgeFailed("test_9_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_10_res = randTest.serialTest();
    if (test_10_res.isError) {
        setBadgeError("test_10_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_10_valueP1", "P-value 1: " + test_10_res.pValue1);
        setPValue("test_10_valueP2", "P-value 2: " + test_10_res.pValue2);
        if (test_10_res.pValue1 >= threshold && test_10_res.pValue2 >= threshold && !test_10_res.pValueOutOfRange) {
            setBadgePassed("test_10_indicator");
        } else {
            setBadgeFailed("test_10_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_11_res = randTest.approximateEntropyTest();
    if (test_11_res.isError) {
        setBadgeError("test_11_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_11_value", test_11_res.pValue);
        if (test_11_res.pValue >= threshold && test_11_res.pValue <= 1 && !test_11_res.pValueOutOfRange) {
            setBadgePassed("test_11_indicator");
        } else {
            setBadgeFailed("test_11_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_12_res = randTest.cumulativeSumsTest();
    if (test_12_res.isError) {
        setBadgeError("test_12_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_12_valuePFWD", "P-value Forward: " + test_12_res.pValueFWD);
        setPValue("test_12_valuePREV", "P-value Reverse: " + test_12_res.pValueREV);
        if (test_12_res.pValueFWD >= threshold && test_12_res.pValueREV >= threshold && !test_12_res.pValueOutOfRange) {
            setBadgePassed("test_12_indicator");
        } else {
            setBadgeFailed("test_12_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_13_res = randTest.randomExcursionsTest();
    if (test_13_res.isError) {
        setBadgeError("test_13_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_13_value", test_13_res.minPValue);
        if (test_13_res.minPValue >= threshold && !test_13_res.pValueOutOfRange) {
            setBadgePassed("test_13_indicator");
        } else {
            setBadgeFailed("test_13_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_14_res = randTest.randomExcursionsVariantTest();
    if (test_14_res.isError) {
        setBadgeError("test_14_indicator");
        failedTestCount++;
        if (stopIfError) { return; }
    } else {
        setPValue("test_14_value", test_14_res.minPValue);
        if (test_14_res.minPValue >= threshold && !test_14_res.pValueOutOfRange) {
            setBadgePassed("test_14_indicator");
        } else {
            setBadgeFailed("test_14_indicator");
            failedTestCount++;
            if (stopIfFailed) { return; }
        }
    }

    return failedTestCount;
}

function resetInputStreamIndicator() {
    $("#pureInputBits").html("");
}

function resetTestIndicators() {
    setBadgeNA("test_1_indicator");
    setPValue("test_1_value", "");

    setBadgeNA("test_2_indicator");
    setPValue("test_2_value", "");

    setBadgeNA("test_3_indicator");
    setPValue("test_3_value", "");

    setBadgeNA("test_4_indicator");
    setPValue("test_4_value", "");

    setBadgeNA("test_5_indicator");
    setPValue("test_5_value", "");

    setBadgeNA("test_6_indicator");
    setPValue("test_6_value", "");

    setBadgeNA("test_7_indicator");
    setPValue("test_7_value", "");

    setBadgeNA("test_8_indicator");
    setPValue("test_8_value", "");

    setBadgeNA("test_9_indicator");
    setPValue("test_9_value", "");

    setBadgeNA("test_10_indicator");
    setPValue("test_10_valueP1", "");
    setPValue("test_10_valueP2", "");

    setBadgeNA("test_11_indicator");
    setPValue("test_11_value", "");

    setBadgeNA("test_12_indicator");
    setPValue("test_12_valuePFWD", "");
    setPValue("test_12_valuePREV", "");

    setBadgeNA("test_13_indicator");
    setPValue("test_13_value", "");

    setBadgeNA("test_14_indicator");
    setPValue("test_14_value", "");
}

function setPValue(badgeID, value) {
    $("#" + badgeID).text(value);
}

function setBadgeNA(badgeID) {
    $("#" + badgeID).text("N / A");
    $("#" + badgeID).removeClass("badge-success badge-danger badge-error");
    $("#" + badgeID).addClass("badge-secondary");
}

function setBadgePassed(badgeID) {
    $("#" + badgeID).text("Passed");
    $("#" + badgeID).removeClass("badge-secondary badge-danger");
    $("#" + badgeID).addClass("badge-success");
}

function setBadgeFailed(badgeID) {
    $("#" + badgeID).text("Failed");
    $("#" + badgeID).removeClass("badge-secondary badge-success");
    $("#" + badgeID).addClass("badge-danger");
}

function setBadgeError(badgeID) {
    $("#" + badgeID).text("Error");
    $("#" + badgeID).removeClass("badge-secondary badge-success");
    $("#" + badgeID).addClass("badge-error");
}


// solution from: https://stackoverflow.com/a/48020189/14132176
function copyToClipboard(containerId) {
    var range = document.createRange();
    range.selectNode(document.getElementById(containerId));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection().removeAllRanges();// to deselect
    alert("Text has been copied to clipboard");
}


// launch help modal
$("#helpModal").modal("show");