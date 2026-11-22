// Generates the online bitstreams (pseudo RNG, π, √2, √3) off the main thread,
// so the page stays responsive while millions of bits are being generated.
importScripts("../math_lib/bit_generators.js");

onmessage = function (event) {
    let { name, bitCount } = event.data;
    let start = performance.now();
    try {
        let bits = BitGenerators.bits(name, bitCount);
        postMessage({ ok: true, bits: bits, ms: performance.now() - start });
    } catch (err) {
        postMessage({ ok: false, error: String(err) });
    }
};
