import { loadCoefficients } from '../data/loader';
import coefficientsData from '../data/igrf13.json';

const ALL_EPOCHS = [
    1900, 1905, 1910, 1915, 1920, 1925, 1930, 1935, 1940, 1945,
    1950, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995,
    2000, 2005, 2010, 2015, 2020
];

function compareCoefficients(
    a: number[][],
    b: number[][],
    precision: number
): void {
    expect(a.length).toBe(b.length);
    for (let n = 0; n < a.length; n++) {
        const rowA = a[n];
        const rowB = b[n];
        if (!rowA || !rowB) throw new Error(`Нет строки n=${n}`);
        expect(rowA.length).toBe(rowB.length);
        for (let m = 0; m < rowA.length; m++) {
            const valA = rowA[m];
            const valB = rowB[m];
            if (valA === undefined || valB === undefined) {
                throw new Error(`Отсутствует элемент (${n},${m})`);
            }
            expect(valA).toBeCloseTo(valB, precision);
        }
    }
}

describe('Загрузка коэффициентов IGRF', () => {
    it('должен загружать коэффициенты для всех эпох', () => {
        for (const year of ALL_EPOCHS) {
            const coefficients = loadCoefficients(year);

            expect(coefficients).toBeDefined();
            expect(coefficients.g).toBeDefined();
            expect(coefficients.h).toBeDefined();
            expect(coefficients.g.length).toBeGreaterThan(0);
            expect(coefficients.h.length).toBeGreaterThan(0);
            expect(coefficients.g.length).toBe(coefficients.h.length);
        }
    });

   

    it('каждый подмассив должен иметь правильную длину n+1 для всех эпох', () => {
        for (const year of ALL_EPOCHS) {
            const coefficients = loadCoefficients(year);

            for (let n = 0; n < coefficients.g.length; n++) {
                const gn = coefficients.g[n];
                const hn = coefficients.h[n];

                if (!gn || !hn) {
                    throw new Error(`Отсутствуют коэффициенты для степени ${n} в эпохе ${year}`);
                }

                expect(gn.length).toBe(n + 1);
                expect(hn.length).toBe(n + 1);
            }
        }
    });

    it('коэффициенты первой степени (диполь) должны быть ненулевыми для всех эпох', () => {
        for (const year of ALL_EPOCHS) {
            const coefficients = loadCoefficients(year);
            const g1 = coefficients.g[1];
            const h1 = coefficients.h[1];

            if (!g1 || !h1) {
                throw new Error(`Отсутствуют коэффициенты n=1 для эпохи ${year}`);
            }

            const g10 = g1[0];
            const g11 = g1[1];
            const h11 = h1[1];

            if (g10 === undefined || g11 === undefined || h11 === undefined) {
                throw new Error(`Отсутствуют дипольные коэффициенты для эпохи ${year}`);
            }

            expect(Math.abs(g10)).toBeGreaterThan(0);
            expect(Math.abs(g11)).toBeGreaterThan(0);
            expect(Math.abs(h11)).toBeGreaterThan(0);
        }
    });

    it('должен выбрасывать ошибку для года до 1900', () => {
        expect(() => loadCoefficients(1899)).toThrow('вне диапазона');
        expect(() => loadCoefficients(1800)).toThrow('вне диапазона');
    });

    it('должен выбрасывать ошибку для года после 2020', () => {
        expect(() => loadCoefficients(2021)).toThrow('вне диапазона');
        expect(() => loadCoefficients(2100)).toThrow('вне диапазона');
    });

    it('год 1900 (левая граница) должен совпадать с JSON', () => {
        const result = loadCoefficients(1900);
        const data = coefficientsData as { epochs: Array<{ year: number; coefficients: { g: number[][]; h: number[][] } }> };
        const epoch = data.epochs.find((e) => e.year === 1900);
        if (!epoch) throw new Error('Нет эпохи 1900 в JSON');
        compareCoefficients(result.g, epoch.coefficients.g, 5);
        compareCoefficients(result.h, epoch.coefficients.h, 5);
    });

    it('год 2020 (правая граница) должен совпадать с JSON', () => {
        const result = loadCoefficients(2020);
        const data = coefficientsData as { epochs: Array<{ year: number; coefficients: { g: number[][]; h: number[][] } }> };
        const epoch = data.epochs.find((e) => e.year === 2020);
        if (!epoch) throw new Error('Нет эпохи 2020 в JSON');
        compareCoefficients(result.g, epoch.coefficients.g, 5);
        compareCoefficients(result.h, epoch.coefficients.h, 5);
    });

    it('год 1995 (серединная эпоха) должен совпадать с JSON', () => {
        const result = loadCoefficients(1995);
        const data = coefficientsData as { epochs: Array<{ year: number; coefficients: { g: number[][]; h: number[][] } }> };
        const epoch = data.epochs.find((e) => e.year === 1995);
        if (!epoch) throw new Error('Нет эпохи 1995 в JSON');
        compareCoefficients(result.g, epoch.coefficients.g, 5);
        compareCoefficients(result.h, epoch.coefficients.h, 5);
    });

    it('год 2017.3 должен давать значения, интерполированные между 2015 и 2020', () => {
        const result = loadCoefficients(2017.3);

        const g1 = result.g[1];
        const h1 = result.h[1];
        const g2 = result.g[2];
        const h2 = result.h[2];
        if (!g1 || !h1 || !g2 || !h2) throw new Error('Нет строк');

        expect(g1[0]).toBeCloseTo(-29424.5964, 4);
        expect(g1[1]).toBeCloseTo(-1478.3698, 4);
        expect(h1[1]).toBeCloseTo(4729.9846, 4);
        expect(g2[0]).toBeCloseTo(-2470.5912, 4);
        expect(g2[1]).toBeCloseTo(2998.308, 4);
        expect(h2[1]).toBeCloseTo(-2912.6574, 4);
        expect(g2[2]).toBeCloseTo(1676.649, 3);
        expect(h2[2]).toBeCloseTo(-684.6878, 4);
    });

});
