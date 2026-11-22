// Generators for the bitstreams that are produced online, in the browser:
// a pseudo-random stream (Math.random) and the binary expansions of the
// mathematical constants π, √2 and √3.
//
// NIST SP 800-22 ships the first 1,000,000 bits of these constants as reference
// data (sts-2.1.2/data/data.pi, data.sqrt2, data.sqrt3). The expansions are
// computed here from scratch with BigInt fixed-point arithmetic and reproduce
// those files bit for bit. Each expansion starts with its integer part, as in
// the NIST files: π = 11.0010010..., √2 = 1.0110101..., √3 = 1.1011101...
//
// This file has no DOM dependencies, so it also runs inside a Web Worker
// (see js/generator-worker.js).

class BitGenerators {
    // Number of bits in a non-negative BigInt.
    static bitLength(n) {
        if (n === 0n) return 0;
        let hex = n.toString(16);
        return (hex.length - 1) * 4 + parseInt(hex[0], 16).toString(2).length;
    }

    // floor(sqrt(n)) for a non-negative BigInt. Recurses on the top half of the
    // bits so every Newton step starts with half the final precision, keeping the
    // total cost close to that of a few full-size divisions.
    static isqrt(n) {
        if (n < 0n) throw new RangeError("isqrt of a negative number");
        if (n < 9007199254740992n) { // 2^53: exact enough to correct below
            let s = BigInt(Math.floor(Math.sqrt(Number(n))));
            while (s * s > n) s--;
            while ((s + 1n) * (s + 1n) <= n) s++;
            return s;
        }
        let k = BigInt(Math.floor((BitGenerators.bitLength(n) - 2) / 4));
        let s = BitGenerators.isqrt(n >> (2n * k)) << k;
        s = (s + n / s) >> 1n;
        s = (s + n / s) >> 1n;
        while (s * s > n) s--;
        while ((s + 1n) * (s + 1n) <= n) s++;
        return s;
    }

    // Chudnovsky binary splitting over terms [a, b). Returns [P, Q, T].
    static chudnovskySplit(a, b) {
        if (b - a === 1) {
            let k = BigInt(a);
            let P, Q;
            if (a === 0) {
                P = 1n;
                Q = 1n;
            } else {
                P = (6n * k - 5n) * (2n * k - 1n) * (6n * k - 1n);
                Q = k * k * k * 10939058860032000n; // 640320^3 / 24
            }
            let T = P * (13591409n + 545140134n * k);
            if (a % 2 === 1) T = -T;
            return [P, Q, T];
        }
        let m = (a + b) >> 1;
        let [P1, Q1, T1] = BitGenerators.chudnovskySplit(a, m);
        let [P2, Q2, T2] = BitGenerators.chudnovskySplit(m, b);
        return [P1 * P2, Q1 * Q2, T1 * Q2 + P1 * T2];
    }

    // floor(π · 2^fracBits)
    static piFixed(fracBits) {
        // Each Chudnovsky term adds log2(640320^3 / 1728) ≈ 47.11 bits.
        let terms = Math.ceil(fracBits / 47.11) + 2;
        let [, Q, T] = BitGenerators.chudnovskySplit(0, terms);
        let F = BigInt(fracBits);
        let sqrt10005 = BitGenerators.isqrt(10005n << (2n * F)); // √10005 · 2^F
        return (426880n * sqrt10005 * Q) / T;
    }

    // floor(√k · 2^fracBits)
    static sqrtFixed(k, fracBits) {
        return BitGenerators.isqrt(BigInt(k) << (2n * BigInt(fracBits)));
    }

    // `bitCount` bits from the generator `name` as a "0"/"1" string:
    // "pseudo" for Math.random, or "pi", "sqrt2", "sqrt3" for the first bits
    // of that constant's binary expansion.
    static bits(name, bitCount) {
        if (name === "pseudo") {
            return BitGenerators.pseudoRandomBits(bitCount);
        }

        let guard = 64; // extra fractional bits so truncation never reaches the output
        let fixed;
        if (name === "pi") {
            fixed = BitGenerators.piFixed(bitCount + guard);
        } else if (name === "sqrt2") {
            fixed = BitGenerators.sqrtFixed(2, bitCount + guard);
        } else if (name === "sqrt3") {
            fixed = BitGenerators.sqrtFixed(3, bitCount + guard);
        } else {
            throw new Error("Unknown constant: " + name);
        }
        return fixed.toString(2).slice(0, bitCount);
    }

    static pseudoRandomBits(bitCount) {
        let chars = new Array(bitCount);
        for (let i = 0; i < bitCount; i++) {
            chars[i] = Math.random() < 0.5 ? "0" : "1";
        }
        return chars.join("");
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = BitGenerators;
}
