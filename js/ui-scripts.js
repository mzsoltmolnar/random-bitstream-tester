// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const THRESHOLD = 0.01;           // significance level α
const STOP_IF_FAILED = false;
const STOP_IF_ERROR = false;
const PREVIEW_COUNT = 10;         // array items shown before "show remaining"
const FULL_TEST_BITS = 1000000;   // the length every test can run on
const DEFAULT_BITS = 1000000;     // default size of the online generators
const MIN_BITS = 100;
const MAX_BITS = SequencePreprocessor.MAX_LENGTH;
const BIT_PRESETS = [100, 1000, 10000, 100000, 250000, 500000, 1000000, 2000000, 5000000, 10000000];
const MIN_CYCLES = 500;           // max(0.005·√n, 500) for n ≤ 10^10: tests 14 and 15

const EXCURSION_STATES = [-4, -3, -2, -1, 1, 2, 3, 4];
const VARIANT_STATES = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const INPUT_LABELS = {
    radRNG: "Radioactive decay RNG",
    adcRNG: "ADC noise RNG",
    pseudoRNG: "JavaScript pseudo RNG",
    manualRNG: "Manual bitstream input",
    constRNG: "Mathematical constant"
};

const CONSTANTS = {
    pi: { label: "π" },
    sqrt2: { label: "√2" },
    sqrt3: { label: "√3" }
};

// Labels for fields shared by several tests. Tests override them below.
const COMMON_LABELS = {
    name: "Test function",
    pValue: "P-value",
    minPValue: "Lowest P-value",
    n: "Sequence length (n)",
    M: "Block length (M)",
    N: "Number of blocks (N)",
    chiSqr: "χ² statistic",
    pValueOutOfRange: "P-value outside [0, 1]",
    isError: "Test error"
};

// Shortest input each test accepts; below it the test reports an error.
const MIN_BITS_BY_TEST = {
    1: 100, 2: 100, 3: 100, 4: 128, 5: 38912, 6: 1000, 7: 1000000, 8: 1000000,
    9: 387840, 10: 1000000, 11: 1000000, 12: 100, 13: 100, 14: 1000000, 15: 1000000
};

// Online generators: the bit-count stepper, the status line and the button of each.
const GENERATORS = {
    pseudo: { countInput: "#pseudoBitCount", hint: "#pseudoBitHint", status: "#pseudoStatus", button: "#generateRandNum" },
    constant: { countInput: "#constantBitCount", hint: "#constantBitHint", status: "#constantStatus", button: "#insertConstant" }
};

function stateLabel(x) {
    return "x = " + (x > 0 ? "+" : "−") + Math.abs(x);
}

// Each test: number, title, RandomTests method, field labels, the P-value
// fields that decide the result (pKeys) and how they are shown in the table.
const TESTS = [
    {
        num: 1, title: "Frequency (Monobit) Test", fn: "frequencyTest",
        labels: { sSum: "Sum of ±1 values (Sₙ)", sObs: "Test statistic (s_obs)" }
    },
    {
        num: 2, title: "Frequency Test within a Block", fn: "frequencyTestBlock",
        labels: {}
    },
    {
        num: 3, title: "Runs Test", fn: "runsTest",
        labels: {
            sum: "Number of ones", piObs: "Proportion of ones (π)",
            tau: "Frequency pre-test bound (τ)", vObs: "Total number of runs (Vₙ(obs))"
        }
    },
    {
        num: 4, title: "Test for the Longest Run of Ones in a Block", fn: "longestRunOfOnesTest",
        labels: { V: "Longest-run classes (V)", K: "Degrees of freedom (K)" }
    },
    {
        num: 5, title: "Binary Matrix Rank Test", fn: "binaryMatrixRankTest",
        labels: { N: "Number of 32 × 32 matrices (N)" }
    },
    {
        num: 6, title: "Discrete Fourier Transform (Spectral) Test", fn: "dftSpectralTest",
        labels: {
            percentile: "Peaks below the 95 % threshold (%)",
            N_l: "Observed peaks below threshold (N₁)",
            N_o: "Expected peaks below threshold (N₀)",
            d: "Normalized difference (d)"
        }
    },
    {
        num: 7, title: "Non-overlapping Template Matching Test", fn: "nonOverlappingTemplateMatchingsTest",
        labels: {
            pValue: "P-value per template", chiSqr: "χ² per template",
            numOfTemplates: "Number of templates (m = 9)"
        },
        itemLabel(key, i) {
            let template = MatchTemplates.template_9[i];
            return template ? "B = " + template.join("") : "[" + i + "]";
        },
        // 148 P-values: the lowest one is compared with a Bonferroni-corrected
        // threshold, otherwise a random sequence would fail most of the time.
        correctedThreshold(r) {
            return THRESHOLD / r.numOfTemplates;
        },
        pClass(p, r) {
            if (p >= THRESHOLD && p <= 1) return "p-pass";
            if (p >= this.correctedThreshold(r)) return "p-warn";
            return "p-fail";
        },
        evaluate(r) {
            let corrected = this.correctedThreshold(r);
            let passedCount = r.pValue.filter(p => p >= THRESHOLD).length;
            return {
                passed: r.minPValue >= corrected && !r.pValueOutOfRange,
                lines: [
                    { label: "Lowest P-value", value: r.minPValue, isP: true },
                    { label: "Templates with P-value ≥ " + THRESHOLD, text: passedCount + " / " + r.numOfTemplates }
                ],
                note: "The test passes when the lowest P-value is ≥ " + THRESHOLD + " / " + r.numOfTemplates +
                    " = " + corrected.toExponential(3) + " (Bonferroni correction). Templates below " + THRESHOLD +
                    " but above that bound are marked amber."
            };
        }
    },
    {
        num: 8, title: "Overlapping Template Matching Test", fn: "overlappingTemplateMatchingTest",
        labels: {}
    },
    {
        num: 9, title: "Maurer’s “Universal Statistical” Test", fn: "universalMaurerTest",
        labels: {
            L: "Block length (L)", Q: "Initialization blocks (Q)", K: "Test blocks (K)",
            sum: "Sum of log₂ distances", sigma: "Standard deviation (σ)",
            variance: "Theoretical variance", expected_value: "Expected value",
            phi: "Test statistic (fₙ)"
        }
    },
    {
        num: 10, title: "Linear Complexity Test", fn: "linearComplexityTest",
        labels: {}
    },
    {
        num: 11, title: "Serial Test", fn: "serialTest",
        labels: { m: "Pattern length (m)", pValue1: "P-value 1 (∇ψ²ₘ)", pValue2: "P-value 2 (∇²ψ²ₘ)" },
        pKeys: [["pValue1", "P-value 1"], ["pValue2", "P-value 2"]]
    },
    {
        num: 12, title: "Approximate Entropy Test", fn: "approximateEntropyTest",
        labels: {
            m: "Block length (m)", seqLength: "Sequence length used",
            ApEn_0: "φ⁽ᵐ⁾", ApEn_1: "φ⁽ᵐ⁺¹⁾", apen: "Approximate entropy ApEn(m)"
        }
    },
    {
        num: 13, title: "Cumulative Sums (Cusum) Test", fn: "cumulativeSumsTest",
        labels: {
            pValueFWD: "P-value (forward)", pValueREV: "P-value (reverse)",
            z: "Largest partial-sum excursion, forward (z)",
            zrev: "Largest partial-sum excursion, reverse (z)"
        },
        pKeys: [["pValueFWD", "P-value Forward"], ["pValueREV", "P-value Reverse"]]
    },
    {
        num: 14, title: "Random Excursions Test", fn: "randomExcursionsTest",
        labels: {
            pValue: "P-value per state", cycleCount: "Number of cycles (J)",
            constraint: "Minimum cycles required", sum: "χ² for the last state (x = +4)"
        },
        states: EXCURSION_STATES,
        itemLabel(key, i) { return stateLabel(EXCURSION_STATES[i]); },
        pKeys: [["minPValue", "Lowest P-value"]]
    },
    {
        num: 15, title: "Random Excursions Variant Test", fn: "randomExcursionsVariantTest",
        labels: {
            pValue: "P-value per state", cycleCount: "Number of cycles (J)",
            constraint: "Minimum cycles required", count: "Visits to the last state (x = +9)"
        },
        states: VARIANT_STATES,
        itemLabel(key, i) { return stateLabel(VARIANT_STATES[i]); },
        pKeys: [["minPValue", "Lowest P-value"]]
    }
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

var preprocessor = new SequencePreprocessor("");
var selectedInput = "";
var currentInput = { label: "", length: 0, cycles: null };
var lastRun = null;
var busy = null; // null, "generating" or "testing"

// ---------------------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------------------

$("input[name='bitstreamInput']").change(bitstreamInputChanged);

$("#copyBitstreamToClipboard").on("click", copyBitstreamToClipboard);

$("#insertRadRandNum").on("click", () => runGeneration(() => loadBitstream(RandomStringsData.randomRADString, INPUT_LABELS.radRNG)));
$("#insertAdcRandNum").on("click", () => runGeneration(() => loadBitstream(RandomStringsData.randomADCString, INPUT_LABELS.adcRNG)));
$("#generateRandNum").on("click", generateRandNum);
$("#insertManualInput").on("click", () => runGeneration(() => loadBitstream($("#manualRandNumbersText").val(), INPUT_LABELS.manualRNG)));
$("#insertConstant").on("click", insertConstant);

$("#startTest").on("click", startTests);
$("#expandAll").on("click", () => $(".test-details").collapse("show"));
$("#collapseAll").on("click", () => $(".test-details").collapse("hide"));
$("#copyJson").on("click", copyResultsJson);
$("#downloadJson").on("click", () => downloadFile(timestampedName("json"), JSON.stringify(buildExport(), null, 2), "application/json"));
$("#downloadCsv").on("click", () => downloadFile(timestampedName("csv"), buildCsv(), "text/csv"));

Object.keys(GENERATORS).forEach(setupBitCount);
buildTestRows();
updateInputStats();

// ---------------------------------------------------------------------------
// Bitstream input
// ---------------------------------------------------------------------------

function loadBitstream(bitString, label) {
    resetInputStreamIndicator();
    resetTestIndicators();
    preprocessor = new SequencePreprocessor(bitString);
    let array = preprocessor.array;
    currentInput = { label: label, length: array.length, cycles: countCycles(array) };
    $("#pureInputBits").text(preprocessor.sequenceString);
    updateInputStats();
}

// Disables the Start Test button and the input controls while a bitstream is
// generated or loaded, so the tests cannot start on a half-loaded input.
async function runGeneration(task) {
    if (busy) return;
    setBusy("generating");
    await sleep(30); // paint the disabled state before any main-thread work
    try {
        await task();
    } finally {
        setBusy(null);
    }
}

function generateRandNum() {
    generateOnline("pseudo", "pseudo", INPUT_LABELS.pseudoRNG, "pseudo-random bits");
}

function insertConstant() {
    let name = $("#constantSelect").val();
    let label = CONSTANTS[name].label;
    generateOnline("constant", name, "Binary expansion of " + label, "bits of " + label);
}

function generateOnline(generatorKey, name, inputLabel, what) {
    let generator = GENERATORS[generatorKey];
    let bitCount = setBitCount(generatorKey, parseBitCount($(generator.countInput).val()));
    let spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ';

    runGeneration(async () => {
        let $status = $(generator.status).removeClass("text-danger");
        $status.html(spinner + "Generating " + formatCount(bitCount) + " " + escapeHtml(what) + "…");
        try {
            let { bits, ms } = await generateBits(name, bitCount);
            $status.html(spinner + "Loading the bitstream…");
            await sleep(30);
            loadBitstream(bits, inputLabel);
            $status.text("Generated " + formatCount(bits.length) + " " + what + " in " + formatDuration(ms) + ".");
        } catch (err) {
            $status.addClass("text-danger").text("Could not generate " + what + ": " + err.message);
        }
    });
}

// Runs the generator in a Web Worker so the page stays responsive. Pages opened
// from file:// cannot start workers; then it runs on the main thread instead.
function generateBits(name, bitCount) {
    let onMainThread = () => sleep(50).then(() => {
        let start = performance.now();
        let bits = BitGenerators.bits(name, bitCount);
        return { bits: bits, ms: performance.now() - start };
    });

    let worker;
    try {
        worker = new Worker("js/generator-worker.js");
    } catch (err) {
        return onMainThread();
    }

    return new Promise((resolve, reject) => {
        worker.onmessage = event => {
            worker.terminate();
            if (event.data.ok) {
                resolve(event.data);
            } else {
                reject(new Error(event.data.error));
            }
        };
        worker.onerror = event => {
            event.preventDefault();
            worker.terminate();
            onMainThread().then(resolve, reject);
        };
        worker.postMessage({ name: name, bitCount: bitCount });
    });
}

// ---------------------------------------------------------------------------
// Bit-count stepper of the online generators
// ---------------------------------------------------------------------------

function setupBitCount(generatorKey) {
    let generator = GENERATORS[generatorKey];
    let $input = $(generator.countInput);
    $input.on("change", () => setBitCount(generatorKey, parseBitCount($input.val())));
    $input.on("keydown", event => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            stepBitCount(generatorKey, event.key === "ArrowUp" ? 1 : -1);
        } else if (event.key === "Enter") {
            event.preventDefault();
            $(generator.button).click();
        }
    });
    $input.closest(".bit-count").find(".bit-step").on("click", function () {
        stepBitCount(generatorKey, Number($(this).data("dir")));
    });
    setBitCount(generatorKey, DEFAULT_BITS);
}

function parseBitCount(text) {
    let digits = String(text).replace(/[^0-9]/g, "");
    return digits === "" ? DEFAULT_BITS : parseInt(digits, 10);
}

// Clamps the count, shows it in the input and on the button, and returns it.
function setBitCount(generatorKey, count) {
    let generator = GENERATORS[generatorKey];
    count = Math.min(MAX_BITS, Math.max(MIN_BITS, count));
    $(generator.countInput).val(formatCount(count));
    $(generator.button).text("Generate " + formatCount(count) + " bits");
    $(generator.hint).html(bitCountHint(count));
    return count;
}

// Moves to the next preset size up or down.
function stepBitCount(generatorKey, direction) {
    let current = parseBitCount($(GENERATORS[generatorKey].countInput).val());
    let next = direction > 0
        ? BIT_PRESETS.find(p => p > current)
        : BIT_PRESETS.slice().reverse().find(p => p < current);
    setBitCount(generatorKey, next === undefined ? current : next);
}

function bitCountHint(count) {
    let blocked = testsTooLongFor(count);
    if (blocked) {
        return '<span class="stat-warn">' + blocked + "</span>";
    }
    if (count > FULL_TEST_BITS) {
        return '<span class="text-muted">Longer inputs take longer to generate and test: about 25 s in total at 5,000,000 bits.</span>';
    }
    return "";
}

// Names the tests that cannot run on `count` bits, e.g. "Tests 7, 8 and 10 need more bits ...".
function testsTooLongFor(count) {
    let blocked = TESTS.filter(t => count < MIN_BITS_BY_TEST[t.num]).map(t => t.num);
    if (blocked.length === 0) return "";
    if (blocked.length === 1) return "Test " + blocked[0] + " needs more bits and will report an error.";
    let list = blocked.slice(0, -1).join(", ") + " and " + blocked[blocked.length - 1];
    return "Tests " + list + " need more bits and will report an error.";
}

// Number of cycles J of the ±1 random walk, counted as in tests 14 and 15.
function countCycles(array) {
    let S = 0;
    let J = 0;
    for (let i = 0; i < array.length; i++) {
        S += 2 * array[i] - 1;
        if (S === 0) J++;
    }
    if (array.length > 0 && S !== 0) J++;
    return J;
}

function updateInputStats() {
    let $stats = $("#inputStats");
    if (currentInput.length === 0) {
        $stats.html('<span class="text-muted">No bitstream inserted yet.</span>');
        return;
    }
    let parts = ["<strong>" + escapeHtml(currentInput.label) + "</strong>",
        currentInput.length.toLocaleString("en-US") + " bits"];
    let blocked = testsTooLongFor(currentInput.length);
    if (blocked) {
        parts.push('<span class="stat-warn">' + blocked + "</span>");
    }
    let cyclesOk = currentInput.cycles >= MIN_CYCLES;
    parts.push('<span class="' + (cyclesOk ? "stat-ok" : "stat-warn") + '">random-walk cycles J = ' +
        currentInput.cycles.toLocaleString("en-US") + " (tests 14–15 need ≥ " + MIN_CYCLES + ")</span>");
    $stats.html(parts.join(" · "));
}

function bitstreamInputChanged() {
    resetInputStreamIndicator();
    resetTestIndicators();
    currentInput = { label: "", length: 0, cycles: null };
    preprocessor = new SequencePreprocessor("");
    updateInputStats();
    $(".generator-status").removeClass("text-danger").empty();
    selectedInput = $("input[name='bitstreamInput']:checked").val();

    let panels = {
        radRNG: "#insertRadRNGCollapse",
        adcRNG: "#insertAdcRNGCollapse",
        pseudoRNG: "#pseudoRNGCollapse",
        manualRNG: "#manualRandNumbersTextCollapse",
        constRNG: "#constantCollapse"
    };
    for (let key in panels) {
        if (key === selectedInput) {
            $(panels[key]).show(250);
        } else {
            $(panels[key]).hide(250);
        }
    }
}

function copyBitstreamToClipboard() {
    copyToClipboard("pureInputBits");
}

function resetInputStreamIndicator() {
    $("#pureInputBits").text("");
}

// ---------------------------------------------------------------------------
// Running the tests
// ---------------------------------------------------------------------------

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startTests() {
    if (busy) return;
    resetTestIndicators();

    if (preprocessor.array.length === 0) {
        showSummary("alert-warning", "Insert an input bitstream before starting the tests.");
        return;
    }

    setBusy("testing");
    let randTest = new RandomTests(preprocessor.array);
    let records = [];

    for (let i = 0; i < TESTS.length; i++) {
        let test = TESTS[i];
        showProgress(i, test);
        setBadge(test.num, "running");
        await sleep(50); // let the browser paint the progress before the test blocks it

        let record = runTest(test, randTest);
        records.push(record);
        renderOutcome(test, record);

        if ((record.status === "error" && STOP_IF_ERROR) || (record.status === "failed" && STOP_IF_FAILED)) {
            break;
        }
    }

    lastRun = { input: Object.assign({}, currentInput), finishedAt: new Date(), records: records };
    hideProgress();
    showRunSummary(lastRun);
    $(".export-btn").prop("disabled", false);
    setBusy(null);
    return records.filter(r => r.status !== "passed").length;
}

// Runs one test and records its result together with the console warnings it raised.
function runTest(test, randTest) {
    let messages = [];
    let originalWarn = console.warn;
    let originalLog = console.log;
    console.warn = function (...args) {
        messages.push(args.map(String).join(" "));
        originalWarn.apply(console, args);
    };
    console.log = function (...args) {
        // Result objects are shown in the details panel; plain text logs are diagnostics.
        if (args.every(a => typeof a === "string")) messages.push(args.join(" "));
        originalLog.apply(console, args);
    };

    let start = performance.now();
    let result = null;
    let exception = null;
    try {
        result = randTest[test.fn]();
    } catch (err) {
        exception = err;
        console.error(err);
    } finally {
        console.warn = originalWarn;
        console.log = originalLog;
    }
    let timeMs = performance.now() - start;

    let record = { test: test, timeMs: timeMs, warnings: messages, result: result, exception: null };
    if (exception) {
        record.status = "error";
        record.exception = String(exception);
    } else if (result.isError) {
        record.status = "error";
    } else {
        record.evaluation = evaluate(test, result);
        record.status = record.evaluation.passed ? "passed" : "failed";
    }
    return record;
}

function evaluate(test, r) {
    if (test.evaluate) return test.evaluate(r);

    let pKeys = test.pKeys || [["pValue", null]];
    let passed = !r.pValueOutOfRange;
    let lines = [];
    for (let [key, label] of pKeys) {
        let p = r[key];
        if (!(p >= THRESHOLD && p <= 1)) passed = false;
        lines.push({ label: label, value: p, isP: true });
    }
    if (test.states) {
        let passedStates = r.pValue.filter(p => p >= THRESHOLD).length;
        lines.push({ label: "States with P-value ≥ " + THRESHOLD, text: passedStates + " / " + r.pValue.length });
    }
    return { passed: passed, lines: lines };
}

function pClassFor(test, p, result) {
    if (test.pClass) return test.pClass(p, result);
    return (p >= THRESHOLD && p <= 1) ? "p-pass" : "p-fail";
}

function isPKey(key) {
    return /^pValue(?!OutOfRange)/.test(key) || key === "minPValue";
}

// ---------------------------------------------------------------------------
// Test table rendering
// ---------------------------------------------------------------------------

function buildTestRows() {
    let html = TESTS.map(test => `
        <hr>
        <div class="row normal-text test-row align-items-center" id="test_${test.num}_row">
            <div class="col-6">
                <button type="button" class="btn btn-link details-toggle collapsed" data-toggle="collapse"
                        data-target="#test_${test.num}_details" aria-expanded="false" aria-controls="test_${test.num}_details">
                    <span class="chevron" aria-hidden="true"></span>${test.num}. ${escapeHtml(test.title)}
                </button>
            </div>
            <div class="col-3 text-center test-values" id="test_${test.num}_values"></div>
            <div class="col-3 text-center">
                <span id="test_${test.num}_indicator" class="badge badge-pill badge-secondary">N / A</span>
            </div>
        </div>
        <div id="test_${test.num}_details" class="collapse test-details">
            <div class="details-panel normal-text" id="test_${test.num}_panel"></div>
        </div>`).join("");
    $("#testRows").html(html);
    TESTS.forEach(test => renderPlaceholder(test.num));
}

function renderPlaceholder(num) {
    $("#test_" + num + "_panel").html('<p class="details-empty">Run the tests to see the values computed by this test.</p>');
}

function renderOutcome(test, record) {
    setBadge(test.num, record.status);

    let $values = $("#test_" + test.num + "_values");
    if (record.evaluation) {
        $values.html(record.evaluation.lines.map(line => {
            let content = line.text !== undefined ? escapeHtml(line.text) : formatNumber(line.value);
            let cls = line.isP ? pClassFor(test, line.value, record.result) : "";
            let label = line.label ? escapeHtml(line.label) + ": " : "";
            return '<p class="value-line">' + label + '<span class="' + cls + '">' + content + "</span></p>";
        }).join(""));
    } else {
        $values.html('<p class="value-line text-muted">See details</p>');
    }

    $("#test_" + test.num + "_panel").html(renderDetails(test, record));
}

function renderDetails(test, record) {
    let r = record.result;
    let html = '<div class="details-meta">Function <code>' + escapeHtml(test.fn) + "()</code> · ran in " +
        formatDuration(record.timeMs) + "</div>";

    if (record.exception) {
        html += '<div class="alert alert-danger details-alert">The test threw an exception: <code>' +
            escapeHtml(record.exception) + "</code></div>";
    }
    if (record.warnings.length > 0) {
        let cls = record.status === "error" ? "alert-danger" : "alert-warning";
        html += '<div class="alert ' + cls + ' details-alert"><strong>Console messages</strong><ul>' +
            record.warnings.map(w => "<li>" + escapeHtml(w) + "</li>").join("") + "</ul></div>";
    }
    if (!r) return html;

    if (r.isError) {
        html += '<p class="details-note">The test did not run to completion, so the values below are the placeholders it returned.</p>';
    } else if (record.evaluation && record.evaluation.note) {
        html += '<p class="details-note">' + escapeHtml(record.evaluation.note) + "</p>";
    }

    let rows = Object.keys(r).map(key => {
        let label = (test.labels && test.labels[key]) || COMMON_LABELS[key] || key;
        return '<tr><th scope="row">' + escapeHtml(label) + ' <code class="field-key">' + escapeHtml(key) + "</code></th>" +
            "<td>" + renderValue(test, key, r[key], r) + "</td></tr>";
    });
    html += '<table class="table table-sm details-table"><tbody>' + rows.join("") + "</tbody></table>";
    return html;
}

function renderValue(test, key, value, result) {
    let colour = isPKey(key) && !result.isError;
    if (Array.isArray(value)) return renderArray(test, key, value, result, colour);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") {
        let cls = colour ? pClassFor(test, value, result) : "";
        return '<span class="' + cls + '">' + formatNumber(value) + "</span>";
    }
    if (key === "name") return "<code>" + escapeHtml(String(value)) + "</code>";
    return escapeHtml(String(value));
}

function renderArray(test, key, values, result, colour) {
    let chip = (v, i) => {
        let label = test.itemLabel ? test.itemLabel(key, i) : "[" + i + "]";
        let cls = colour && typeof v === "number" ? pClassFor(test, v, result) : "";
        return '<span class="value-chip ' + cls + '"><span class="chip-label">' + escapeHtml(label) +
            '</span><span class="chip-value">' + formatNumber(v) + "</span></span>";
    };

    let count = values.length;
    let shown = values.slice(0, PREVIEW_COUNT);
    let rest = values.slice(PREVIEW_COUNT);

    let html = '<div class="array-meta">' + count.toLocaleString("en-US") + (count === 1 ? " value" : " values");
    if (rest.length > 0) html += " · showing the first " + PREVIEW_COUNT;
    html += "</div>";
    html += '<div class="value-grid">' + shown.map((v, i) => chip(v, i)).join("") + "</div>";

    if (rest.length > 0) {
        let id = "test_" + test.num + "_" + key + "_rest";
        html += '<button type="button" class="btn btn-sm btn-outline-secondary show-rest collapsed" data-toggle="collapse" ' +
            'data-target="#' + id + '" aria-expanded="false" aria-controls="' + id + '">' +
            '<span class="chevron" aria-hidden="true"></span>Show the remaining ' + rest.length.toLocaleString("en-US") +
            (rest.length === 1 ? " value" : " values") + "</button>";
        html += '<div class="collapse" id="' + id + '"><div class="value-grid value-grid-scroll">' +
            rest.map((v, i) => chip(v, i + PREVIEW_COUNT)).join("") + "</div></div>";
    }
    return html;
}

function resetTestIndicators() {
    lastRun = null;
    TESTS.forEach(test => {
        setBadge(test.num, "na");
        $("#test_" + test.num + "_values").empty();
        renderPlaceholder(test.num);
    });
    $("#runSummary").prop("hidden", true);
    $(".export-btn").prop("disabled", true);
}

const BADGES = {
    na: { text: "N / A", cls: "badge-secondary" },
    running: { text: "Running", cls: "badge-info", spinner: true },
    passed: { text: "Passed", cls: "badge-success" },
    failed: { text: "Failed", cls: "badge-danger" },
    error: { text: "Error", cls: "badge-danger" }
};

function setBadge(num, status) {
    let badge = BADGES[status];
    let $badge = $("#test_" + num + "_indicator");
    $badge.removeClass("badge-secondary badge-info badge-success badge-danger").addClass(badge.cls);
    if (badge.spinner) {
        $badge.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ' + badge.text);
    } else {
        $badge.text(badge.text);
    }
}

// ---------------------------------------------------------------------------
// Progress, summary and busy state
// ---------------------------------------------------------------------------

// mode: null when idle, "generating" while an input is generated or loaded,
// "testing" while the tests run. Only a test run shows a spinner on Start Test.
function setBusy(mode) {
    busy = mode;
    let isBusy = mode !== null;
    $("#startTest, .input-control").prop("disabled", isBusy);
    $("input[name='bitstreamInput']").prop("disabled", isBusy);
    $("#startTest").html(mode === "testing"
        ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Running…'
        : "Start Test");
}

function showProgress(index, test) {
    let percent = Math.round(index / TESTS.length * 100);
    $("#runProgress").prop("hidden", false);
    $("#runProgressBar").css("width", percent + "%").attr("aria-valuenow", percent);
    $("#runProgressLabel").text("Running test " + test.num + " of " + TESTS.length + ": " + test.title);
}

function hideProgress() {
    $("#runProgress").prop("hidden", true);
}

function showSummary(alertClass, html) {
    $("#runSummary")
        .removeClass("alert-success alert-warning alert-danger")
        .addClass(alertClass)
        .html(html)
        .prop("hidden", false);
}

function showRunSummary(run) {
    let counts = countStatuses(run.records);
    let totalMs = run.records.reduce((sum, r) => sum + r.timeMs, 0);
    let notRun = TESTS.length - run.records.length;

    let parts = ["<strong>" + counts.passed + " / " + TESTS.length + " passed</strong>"];
    if (counts.failed) parts.push(counts.failed + " failed");
    if (counts.error) parts.push(counts.error + (counts.error === 1 ? " error" : " errors"));
    if (notRun) parts.push(notRun + " not run");
    parts.push("test time " + formatDuration(totalMs));
    parts.push("input: " + escapeHtml(run.input.label) + " (" + run.input.length.toLocaleString("en-US") + " bits)");

    let html = parts.join(" · ");
    let excursionErrors = run.records.filter(r => r.test.states && r.status === "error");
    if (excursionErrors.length > 0 && run.input.cycles < MIN_CYCLES) {
        html += '<div class="summary-hint">Tests 14–15 need at least ' + MIN_CYCLES + " random-walk cycles; this input has J = " +
            run.input.cycles + ". The mathematical constant inputs (π, √2, √3) have enough.</div>";
    }

    let alertClass = counts.passed === TESTS.length ? "alert-success" : (counts.failed || counts.error ? "alert-warning" : "alert-success");
    showSummary(alertClass, html);
}

function countStatuses(records) {
    let counts = { passed: 0, failed: 0, error: 0 };
    records.forEach(r => counts[r.status]++);
    return counts;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

function buildExport() {
    let counts = countStatuses(lastRun.records);
    return {
        tool: "Random Bitstream Tester",
        generatedAt: lastRun.finishedAt.toISOString(),
        input: {
            source: lastRun.input.label,
            length: lastRun.input.length,
            randomWalkCycles: lastRun.input.cycles
        },
        threshold: THRESHOLD,
        summary: {
            passed: counts.passed,
            failed: counts.failed,
            errors: counts.error,
            notRun: TESTS.length - lastRun.records.length,
            totalTestTimeMs: Math.round(lastRun.records.reduce((sum, r) => sum + r.timeMs, 0))
        },
        tests: lastRun.records.map(r => ({
            number: r.test.num,
            name: r.test.title,
            function: r.test.fn,
            status: r.status,
            timeMs: Math.round(r.timeMs),
            warnings: r.warnings,
            exception: r.exception,
            result: r.result
        }))
    };
}

// Long format: one row per scalar field and one row per array item.
function buildCsv() {
    let rows = [["test_number", "test_name", "status", "field", "label", "index", "item_label", "value"]];
    lastRun.records.forEach(record => {
        let test = record.test;
        let base = [test.num, test.title, record.status];
        if (!record.result) {
            rows.push(base.concat(["exception", "Exception", "", "", record.exception]));
            return;
        }
        Object.keys(record.result).forEach(key => {
            let label = (test.labels && test.labels[key]) || COMMON_LABELS[key] || key;
            let value = record.result[key];
            if (Array.isArray(value)) {
                value.forEach((v, i) => {
                    let itemLabel = test.itemLabel ? test.itemLabel(key, i) : "";
                    rows.push(base.concat([key, label, i, itemLabel, v]));
                });
            } else {
                rows.push(base.concat([key, label, "", "", value]));
            }
        });
    });
    return rows.map(row => row.map(csvCell).join(",")).join("\r\n");
}

function csvCell(value) {
    let s = value === null || value === undefined ? "" : String(value);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function timestampedName(extension) {
    let d = lastRun.finishedAt;
    let pad = n => String(n).padStart(2, "0");
    return "bitstream-test-results-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" +
        pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + "." + extension;
}

function downloadFile(filename, content, mimeType) {
    let blob = new Blob([content], { type: mimeType + ";charset=utf-8" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function copyResultsJson() {
    let text = JSON.stringify(buildExport(), null, 2);
    let done = () => flashButton("#copyJson", "Copied!");
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, () => copyTextFallback(text) && done());
    } else if (copyTextFallback(text)) {
        done();
    }
}

function copyTextFallback(text) {
    let area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = document.execCommand("copy");
    area.remove();
    return ok;
}

function flashButton(selector, text) {
    let $btn = $(selector);
    let original = $btn.data("label") || $btn.text();
    $btn.data("label", original).text(text);
    setTimeout(() => $btn.text(original), 1500);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(value) {
    if (typeof value !== "number") return escapeHtml(String(value));
    if (Number.isNaN(value)) return "NaN";
    if (!Number.isFinite(value)) return value > 0 ? "∞" : "−∞";
    return String(value);
}

function formatCount(count) {
    return count.toLocaleString("en-US");
}

function formatDuration(ms) {
    return ms < 1000 ? Math.round(ms) + " ms" : (ms / 1000).toFixed(2) + " s";
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
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
