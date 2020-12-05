// Ported to JavaScript by Zsolt Molnar (https://mzsoltmolnar.github.io/)
// Based on NIST Statistical Test Suite ANSI C code:
// https://csrc.nist.gov/Projects/Random-Bit-Generation/Documentation-and-Software

class MathFunc {
    static MAXLOG = 7.09782712893383996732224E2;
    static MACHEP = 1.11022302462515654042E-16;
    static MAXNUM = 1.7976931348623158E308;
    static PI = 3.14159265358979323846;
    static MAXLGM = 2.556348E305;

    // A[]: Stirling's formula expansion of log gamma
    // B[], C[]: log gamma function between 2 and 3
    static A = [8.116142e-04, -5.950619e-04, 7.936503e-04, -2.777778e-03, 8.333333e-02];
    static B = [-1.378252e+03, -3.880163e+04, -3.316130e+05, -1.162371e+06, -1.721737e+06, -8.535557e+05];
    static C = [-3.518157e+02, -1.706421e+04, -2.205286e+05, -1.139334e+06, -2.532523e+06, -2.018891e+06];

    static big = 4.503599627370496e15;
    static biginv = 2.22044604925031308085e-16;
    static rel_error = 1E-12;

    static sgngam = 0;

    constructor() {
    }

    static igamc(a, x) {
        let ans, ax, c, yc, r, t, y, z;
        let pk, pkm1, pkm2, qk, qkm1, qkm2;

        if ((x <= 0) || (a <= 0)) {
            return (1.0);
        }

        if ((x < 1.0) || (x < a)) {
            return (1.e0 - this.igam(a, x));
        }

        ax = a * Math.log(x) - x - this.lgam(a);
        if (ax < -this.MAXLOG) {
            console.log("igamc: UNDERFLOW");
            return 0.0;
        }
        ax = Math.exp(ax);

        /* continued fraction */
        y = 1.0 - a;
        z = x + y + 1.0;
        c = 0.0;
        pkm2 = 1.0;
        qkm2 = x;
        pkm1 = x + 1.0;
        qkm1 = z * x;
        ans = pkm1 / qkm1;

        do {
            c += 1.0;
            y += 1.0;
            z += 2.0;
            yc = y * c;
            pk = pkm1 * z - pkm2 * yc;
            qk = qkm1 * z - qkm2 * yc;
            if (qk !== 0) {
                r = pk / qk;
                t = Math.abs((ans - r) / r);
                ans = r;
            }
            else {
                t = 1.0;
            }
            pkm2 = pkm1;
            pkm1 = pk;
            qkm2 = qkm1;
            qkm1 = qk;
            if (Math.abs(pk) > this.big) {
                pkm2 *= this.biginv;
                pkm1 *= this.biginv;
                qkm2 *= this.biginv;
                qkm1 *= this.biginv;
            }
        } while (t > this.MACHEP);

        return ans * ax;
    }

    // incomplete gamma function
    static igam(a, x) { //
        let ans, ax, c, r;

        if ((x <= 0) || (a <= 0)) {
            return 0.0;
        }

        if ((x > 1.0) && (x > a)) {
            return 1.e0 - this.igamc(a, x);
        }

        /* Compute  x**a * exp(-x) / gamma(a)  */
        ax = a * Math.log(x) - x - this.lgam(a);
        if (ax < -this.MAXLOG) {
            console.log("igam: UNDERFLOW");
            return 0.0;
        }
        ax = Math.exp(ax);

        /* power series */
        r = a;
        c = 1.0;
        ans = 1.0;

        do {
            r += 1.0;
            c *= x / r;
            ans += c;
        } while (c / ans > this.MACHEP);

        return ans * ax / a;
    }

    // logarithmic gamma function
    static lgam(x) { //
        let p, q, u, w, z;
        let i;

        this.sgngam = 1;

        if (x < -34.0) {
            q = -x;
            w = this.lgam(q); /* note this modifies sgngam! */
            p = Math.floor(q);
            if (p === q) {
                console.log("lgam: OVERFLOW");
                return this.sgngam * this.MAXNUM;
            }
            i = Math.trunc(p);
            if ((i & 1) === 0) {
                this.sgngam = -1;
            }
            else {
                this.sgngam = 1;
            }
            z = q - p;
            if (z > 0.5) {
                p += 1.0;
                z = p - q;
            }
            z = q * Math.sin(this.PI * z);
            if (z === 0.0) {
                console.log("lgam: OVERFLOW");
                return this.sgngam * this.MAXNUM;
            }
            /*      z = log(PI) - log( z ) - w;*/
            z = Math.log(this.PI) - Math.log(z) - w;
            return z;
        }

        if (x < 13.0) {
            z = 1.0;
            p = 0.0;
            u = x;
            while (u >= 3.0) {
                p -= 1.0;
                u = x + p;
                z *= u;
            }
            while (u < 2.0) {
                if (u === 0.0) {
                    console.log("lgam: OVERFLOW");
                    return this.sgngam * this.MAXNUM;
                }
                z /= u;
                p += 1.0;
                u = x + p;
            }
            if (z < 0.0) {
                this.sgngam = -1;
                z = -z;
            }
            else {
                this.sgngam = 1;
            }
            if (u === 2.0) {
                return (Math.log(z));
            }
            p -= 2.0;
            x = x + p;

            p = x * this.polevl(x, this.B, 5) / this.p1evl(x, this.C, 6);

            return Math.log(z) + p;
        }

        if (x > this.MAXLGM) {
            console.log("lgam: OVERFLOW");
            return this.sgngam * this.MAXNUM;
        }

        q = (x - 0.5) * Math.log(x) - x + Math.log(Math.sqrt(2 * this.PI));
        if (x > 1.0e8) {
            return q;
        }

        p = 1.0 / (x * x);
        if (x >= 1000.0) {
            q += ((7.9365079365079365079365e-4 * p - 2.7777777777777777777778e-3) * p + 0.0833333333333333333333) / x;
        }
        else {
            q += this.polevl(p, this.A, 4) / x;
        }

        return q;
    }

    static polevl(x, coef, N) {
        let ans;
        let i;
        let p = 0;

        ans = coef[p];
        p++;
        i = N;

        do {
            ans = ans * x + coef[p];
            p++;
        }
        while (--i);

        return ans;
    }

    static p1evl(x, coef, N) {
        let ans;
        let p = 0;
        let i;

        ans = x + coef[p];
        p++;
        i = N - 1;

        do {
            ans = ans * x + coef[p];
            p++;
        }
        while (--i);

        return ans;
    }

    static erf(x) {
        let two_sqrtpi = 1.128379167095512574;
        let sum = x;
        let term = x;
        let xsqr = x * x;
        let j = 1;

        if (Math.abs(x) > 2.2) {
            return 1.0 - this.erfc(x);
        }

        do {
            term *= xsqr / j;
            sum -= term / (2 * j + 1);
            j++;
            term *= xsqr / j;
            sum += term / (2 * j + 1);
            j++;
        } while (Math.abs(term) / sum > this.rel_error);

        return two_sqrtpi * sum;
    }

    static erfc(x) {
        let one_sqrtpi = 0.564189583547756287;
        let a = 1;
        let b = x;
        let c = x;
        let d = x * x + 0.5;

        let q1;
        let q2 = b / d;
        let n = 1.0;
        let t;

        if (Math.abs(x) < 2.2) {
            return 1.0 - this.erf(x);
        }
        if (x < 0) {
            return 2.0 - this.erfc(-x);
        }

        do {
            t = a * n + b * x;
            a = b;
            b = t;
            t = c * n + d * x;
            c = d;
            d = t;
            n += 0.5;
            q1 = q2;
            q2 = b / d;
        } while (Math.abs(q1 - q2) / q2 > this.rel_error);

        return one_sqrtpi * Math.exp(-x * x) * q2;
    }

    static normal(x) {
        let arg;
        let result;
        let sqrt2 = 1.414213562373095048801688724209698078569672;

        if (x > 0) {
            arg = x / sqrt2;
            result = 0.5 * (1 + this.erf(arg));
        }
        else {
            arg = -x / sqrt2;
            result = 0.5 * (1 - this.erf(arg));
        }

        return (result);
    }
}
