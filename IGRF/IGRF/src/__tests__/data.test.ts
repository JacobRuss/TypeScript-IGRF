import { loadCoefficients } from '../data/loader';

const ALL_EPOCHS = [
    1900, 1905, 1910, 1915, 1920, 1925, 1930, 1935, 1940, 1945,
    1950, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995,
    2000, 2005, 2010, 2015, 2020
];

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

    it('должен выбрасывать ошибку для неизвестного года', () => {
        expect(() => loadCoefficients(1993)).toThrow(
            'Коэффициенты для года 1993 не найдены'
        );
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
});
