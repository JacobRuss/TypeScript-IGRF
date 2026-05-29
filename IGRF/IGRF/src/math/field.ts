import { computeLegendre } from './legendre';
import { loadCoefficients } from '../data/loader';

interface FieldResult {
    X: number;
    Y: number;
    Z: number;
    F: number;
}

function calculateField(
    theta: number,
    phi: number,
    r: number,
    year: number
): FieldResult {
    const A = 6371.2;
    const coefficients = loadCoefficients(year);
    const { P, dP } = computeLegendre(theta, 13);

    let X = 0;
    let Y = 0;
    let Z = 0;

    const ratio = A / r;

    for (let n = 1; n <= 13; n++) {
        const radiusFactor = Math.pow(ratio, n + 2);
        const rowG = coefficients.g[n];
        const rowH = coefficients.h[n];
        const rowP = P[n];
        const rowDP = dP[n];

        if (!rowG || !rowH || !rowP || !rowDP) {
            continue;
        }

        for (let m = 0; m <= n; m++) {
            const g = rowG[m];
            const h = rowH[m];
            const pVal = rowP[m];
            const dpVal = rowDP[m];

            if (g === undefined || h === undefined || pVal === undefined || dpVal === undefined) {
                continue;
            }

            const cosMPhi = Math.cos(m * phi);
            const sinMPhi = Math.sin(m * phi);

            const bracket = g * cosMPhi + h * sinMPhi;
            const bracketY = g * sinMPhi - h * cosMPhi;

            X += radiusFactor * bracket * dpVal;
            Z -= radiusFactor * bracket * (n + 1) * pVal;

            if (m > 0) {
                const sinTheta = Math.sin(theta);
                if (Math.abs(sinTheta) > 1e-10) {
                    Y += radiusFactor * bracketY * m * pVal / sinTheta;
                } else {
                    if (m === 1) {
                        const cosTheta = Math.cos(theta);
                        Y += radiusFactor * bracketY * dpVal * cosTheta;
                    }
                }
            }
        }
    }

    const F = Math.sqrt(X * X + Y * Y + Z * Z);

    return { X, Y, Z, F };
}

export { calculateField };
export type { FieldResult };