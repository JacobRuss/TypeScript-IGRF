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

function loadCoefficients(year: number): EpochCoefficients {
    const data = coefficientsData as CoefficientsFile;

    const epoch = data.epochs.find((e) => e.year === year);

    if (!epoch) {
        throw new Error(`Коэффициенты для года ${year} не найдены`);
    }

    validateCoefficients(epoch.coefficients);

    return epoch.coefficients;
}

export { loadCoefficients };
export type { EpochCoefficients, Epoch, CoefficientsFile };