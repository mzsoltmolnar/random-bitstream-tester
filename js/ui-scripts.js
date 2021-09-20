$("#radRNG").change(bitstreamInputChanged);
$("#adcRNG").change(bitstreamInputChanged);
$("#pseudoRNG").change(bitstreamInputChanged);
$("#manualRNG").change(bitstreamInputChanged);

$("#copyBitstreamToClipboard").on("click", copyBitstreamToClipboard);

$("#insertRadRandNum").on("click", insertRadRandNum);
$("#insertAdcRandNum").on("click", insertAdcRandNum);
$("#generateRandNum").on("click", generateRandNum);
$("#insertManualInput").on("click", insertManualInput);

$("#startTest").on("click", startTests);

$("#generateRandNum").on("click", generateRandNum);

var preprocessor = new SequencePreprocessor("");

var selectedInput = "";

function insertRadRandNum() {
    resetIndicators();
    preprocessor = new SequencePreprocessor(RandomStringsData.randomRADString);
    $("#pureInputBits").html(preprocessor.sequenceString);
}

function insertAdcRandNum() {
    resetIndicators();
    preprocessor = new SequencePreprocessor(RandomStringsData.randomADCString);
    $("#pureInputBits").html(preprocessor.sequenceString);
}

function generateRandNum() {
    resetIndicators();
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

function insertManualInput() {
    resetIndicators();
    let inputText = $("#manualRandNumbersText").val();

    preprocessor = new SequencePreprocessor(inputText);
    // preprocessor = new SequencePreprocessor("");
    // preprocessor.randomnessExtractor(inputText);

    $("#pureInputBits").html(preprocessor.sequenceString);
}

function startTests() {
    executeTests(preprocessor.array);
}

function bitstreamInputChanged() {
    resetIndicators();
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
    let isOneTestFailed = false;

    let test_1_res = randTest.frequencyTest();
    if (test_1_res.isError) {
        setBadgeError("test_1_indicator");
    } else {
        setPValue("test_1_value", test_1_res.pValue);
        if (test_1_res.pValue >= threshold && test_1_res.pValue <= 1) {
            setBadgePassed("test_1_indicator");
        } else {
            setBadgeFailed("test_1_indicator");
            isOneTestFailed = true;
            if (stopIfFailed) { return; }
        }
    }

    await sleep(300);

    let test_2_res = randTest.frequencyTestBlock().pValue;
    setPValue("test_2_value", test_2_res);
    if (test_2_res >= threshold && test_2_res <= 1) {
        setBadgePassed("test_2_indicator");
    } else {
        setBadgeFailed("test_2_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_3_res = randTest.runsTest().pValue;
    setPValue("test_3_value", test_3_res);
    if (test_3_res >= threshold && test_3_res <= 1) {
        setBadgePassed("test_3_indicator");
    } else {
        setBadgeFailed("test_3_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_4_res = randTest.longestRunOfOnesTest().pValue;
    setPValue("test_4_value", test_4_res);
    if (test_4_res >= threshold && test_4_res <= 1) {
        setBadgePassed("test_4_indicator");
    } else {
        setBadgeFailed("test_4_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_5_res = randTest.binaryMatrixRankTest().pValue;
    setPValue("test_5_value", test_5_res);
    if (test_5_res >= threshold && test_5_res <= 1) {
        setBadgePassed("test_5_indicator");
    } else {
        setBadgeFailed("test_5_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_6_res = randTest.nonOverlappingTemplateMatchingsTest().pValue;
    setPValue("test_6_value", test_6_res);
    if (test_6_res >= threshold && test_6_res <= 1) {
        setBadgePassed("test_6_indicator");
    } else {
        setBadgeFailed("test_6_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_7_res = randTest.overlappingTemplateMatchingTest().pValue;
    setPValue("test_7_value", test_7_res);
    if (test_7_res >= threshold && test_7_res <= 1) {
        setBadgePassed("test_7_indicator");
    } else {
        setBadgeFailed("test_7_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_8_res = randTest.universalMaurerTest().pValue;
    setPValue("test_8_value", test_8_res);
    if (test_8_res >= threshold && test_8_res <= 1) {
        setBadgePassed("test_8_indicator");
    } else {
        setBadgeFailed("test_8_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_9_res = randTest.linearComplexityTest().pValue;
    setPValue("test_9_value", test_9_res);
    if (test_9_res >= threshold && test_9_res <= 1) {
        setBadgePassed("test_9_indicator");
    } else {
        setBadgeFailed("test_9_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_10_res = randTest.serialTest();
    setPValue("test_10_valueP1", "P-value 1: " + test_10_res.pValue1);
    setPValue("test_10_valueP2", "P-value 2: " + test_10_res.pValue2);
    if (test_10_res.pValue1 >= threshold && test_10_res.pValue2 >= threshold && !test_10_res.pValueOutOfRange) {
        setBadgePassed("test_10_indicator");
    } else {
        setBadgeFailed("test_10_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_11_res = randTest.approximateEntropyTest().pValue;
    setPValue("test_11_value", test_11_res);
    if (test_11_res >= threshold && test_11_res <= 1) {
        setBadgePassed("test_11_indicator");
    } else {
        setBadgeFailed("test_11_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_12_res = randTest.cumulativeSumsTest();
    setPValue("test_12_valuePFWD", "P-value Forward: " + test_12_res.pValueFWD);
    setPValue("test_12_valuePREV", "P-value Reverse: " + test_12_res.pValueREV);
    if (test_12_res.pValueFWD >= threshold && test_12_res.pValueREV >= threshold && !test_12_res.pValueOutOfRange) {
        setBadgePassed("test_12_indicator");
    } else {
        setBadgeFailed("test_12_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_13_res = randTest.randomExcursionsTest();
    setPValue("test_13_value", test_13_res.minPValue);
    if (test_13_res.minPValue >= threshold && !test_13_res.pValueOutOfRange) {
        setBadgePassed("test_13_indicator");
    } else {
        setBadgeFailed("test_13_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    await sleep(300);

    let test_14_res = randTest.randomExcursionsVariantTest();
    setPValue("test_14_value", test_14_res.minPValue);
    if (test_14_res.minPValue >= threshold && !test_14_res.pValueOutOfRange) {
        setBadgePassed("test_14_indicator");
    } else {
        setBadgeFailed("test_14_indicator");
        isOneTestFailed = true;
        if (stopIfFailed) { return; }
    }

    return isOneTestFailed;
}

function resetIndicators() {
    $("#pureInputBits").html("");

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
    $("#" + badgeID).removeClass("badge-success badge-danger");
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
    $("#" + badgeID).addClass("badge-danger");
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