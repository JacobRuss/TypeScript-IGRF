import coefficientsData from './igrf13.json';

interface EpochCoefficients {
    g: number[][];
    h: number[][];
}

interface Epoch {
    year: number;
    coefficients: EpochCoefficients;
}

interface CoefficientsFile {
    name: string;
    epochs: Epoch[];
}

function validateCoefficients(coefficients: EpochCoefficients): void {
    if (!coefficients) {
        throw new Error('Коэффициенты отсутствуют');
    }

    const g = coefficients.g;
    const h = coefficients.h;

    if (!Array.isArray(g) || !Array.isArray(h)) {
        throw new Error('Коэффициенты g и h должны быть массивами');
    }

    if (g.length === 0 || h.length === 0) {
        throw new Error('Массивы коэффициентов g и h не должны быть пустыми');
    }

    if (g.length !== h.length) {
        throw new Error('Массивы g и h должны быть одинаковой длины');
    }

    for (let n = 0; n < g.length; n++) {
        const gn = g[n];
        const hn = h[n];

        if (!Array.isArray(gn) || !Array.isArray(hn)) {
            throw new Error(`Коэффициенты для степени ${n} должны быть массивами`);
        }

        if (gn.length !== hn.length) {
            throw new Error(
                `Не совпадает количество коэффициентов для степени ${n}: g имеет ${gn.length}, h имеет ${hn.length}`
            );
        }

        const expectedLength = n + 1;

        if (gn.length !== expectedLength) {
            throw new Error(
                `Для степени ${n} ожидалось ${expectedLength} коэффициентов, получено ${gn.length}`
            );
        }
    }
}

function findNearestEpochs(epochs: Epoch[], year: number): { epoch1: Epoch; epoch2: Epoch } {
    const sorted = [...epochs].sort((a, b) => a.year - b.year);

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) {
        throw new Error('Массив эпох пуст');
    }

    if (year < first.year || year > last.year) {
        throw new Error(
            `Год ${year} вне диапазона модели (${first.year}–${last.year})`
        );
    }

    for (let i = 0; i < sorted.length - 1; i++) {
        const e1 = sorted[i];
        const e2 = sorted[i + 1];
        if (e1 === undefined || e2 === undefined) continue;
        if (year >= e1.year && year <= e2.year) {
            return { epoch1: e1, epoch2: e2 };
        }
    }

    if (!last) {
        throw new Error('Нет доступных эпох');
    }
    return { epoch1: last, epoch2: last };
}

function interpolateCoefficients(
    epoch1: Epoch,
    epoch2: Epoch,
    year: number
): EpochCoefficients {
    if (epoch1.year === epoch2.year) {
        return epoch1.coefficients;
    }

    const t = (year - epoch1.year) / (epoch2.year - epoch1.year);
    const g1 = epoch1.coefficients.g;
    const h1 = epoch1.coefficients.h;
    const g2 = epoch2.coefficients.g;
    const h2 = epoch2.coefficients.h;

    const g: number[][] = [];
    const h: number[][] = [];

    for (let n = 0; n < g1.length; n++) {
        g[n] = [];
        h[n] = [];

        const row1g = g1[n];
        const row2g = g2[n];
        const row1h = h1[n];
        const row2h = h2[n];

        if (!row1g || !row2g || !row1h || !row2h) {
            throw new Error(`Отсутствуют коэффициенты для степени ${n}`);
        }

        for (let m = 0; m < row1g.length; m++) {
            const v1g = row1g[m];
            const v2g = row2g[m];
            const v1h = row1h[m];
            const v2h = row2h[m];

            if (v1g === undefined || v2g === undefined || v1h === undefined || v2h === undefined) {
                throw new Error(`Отсутствуют коэффициенты для степени ${n}, порядка ${m}`);
            }

            const rowG = g[n];
            const rowH = h[n];

            if (!rowG || !rowH) {
                throw new Error(`Отсутствует результирующая строка для степени ${n}`);
            }

            rowG[m] = v1g + (v2g - v1g) * t;
            rowH[m] = v1h + (v2h - v1h) * t;
        }
    }

    return { g, h };
}

function loadCoefficients(year: number): EpochCoefficients {
    const data = coefficientsData as CoefficientsFile;

    const { epoch1, epoch2 } = findNearestEpochs(data.epochs, year);
    const coefficients = interpolateCoefficients(epoch1, epoch2, year);
    validateCoefficients(coefficients);

    return coefficients;
}

export { loadCoefficients };
export type { EpochCoefficients, Epoch, CoefficientsFile };