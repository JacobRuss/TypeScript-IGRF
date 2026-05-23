import { computeLegendre } from '../math/legendre';

function getValue(arr: number[][], n: number, m: number): number {
    const row = arr[n];
    if (!row) {
        throw new Error(`Отсутствует строка n=${n}`);
    }
    const value = row[m];
    if (value === undefined) {
        throw new Error(`Отсутствует элемент (${n},${m})`);
    }
    return value;
}

describe('computeLegendre', () => {
    const maxN = 13;

    describe('Корректность вычислений', () => {
        it('P(0,0) должен быть равен 1 при любом theta', () => {
            const angles = [0, Math.PI / 4, Math.PI / 2, Math.PI];
            for (const theta of angles) {
                const result = computeLegendre(theta, 0);
                expect(getValue(result.P, 0, 0)).toBeCloseTo(1.0, 10);
                expect(getValue(result.dP, 0, 0)).toBeCloseTo(0.0, 10);
            }
        });

        it('на полюсе (theta=0) все P(n,n) для n>=1 должны быть равны 0', () => {
            const result = computeLegendre(0, 5);
            for (let n = 1; n <= 5; n++) {
                expect(getValue(result.P, n, n)).toBeCloseTo(0.0, 10);
            }
        });

        it('на полюсе (theta=0) зональные полиномы P(n,0) для n>=1 должны быть строго равны 1.0', () => {
            const result = computeLegendre(0, 5);
            for (let n = 1; n <= 5; n++) {
                expect(getValue(result.P, n, 0)).toBeCloseTo(1.0, 10);
            }
        });

        it('на полюсе (theta=0) производные dP(n,m) должны соответствовать физике поля', () => {
            const result = computeLegendre(0, 5);
            for (let n = 1; n <= 5; n++) {
                for (let m = 0; m <= n; m++) {
                    const dp = getValue(result.dP, n, m);
                    if (m === 1) {
                        expect(Math.abs(dp)).toBeGreaterThan(0.1);
                    } else {
                        expect(dp).toBeCloseTo(0.0, 10);
                    }
                }
            }
        });

        it('на экваторе (theta=pi/2) P(1,0) должен быть равен 0', () => {
            const result = computeLegendre(Math.PI / 2, 1);
            expect(getValue(result.P, 1, 0)).toBeCloseTo(0.0, 10);
        });

        it('на экваторе (theta=pi/2) P(1,1) должен быть ненулевым', () => {
            const result = computeLegendre(Math.PI / 2, 1);
            expect(Math.abs(getValue(result.P, 1, 1))).toBeGreaterThan(0);
        });

        it('значения P(2,0) должны соответствовать аналитической формуле Лежандра', () => {
            const thetas = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2];
            for (const theta of thetas) {
                const result = computeLegendre(theta, 2);
                const cos = Math.cos(theta);
                const expected = (3 * cos * cos - 1) / 2;
                expect(getValue(result.P, 2, 0)).toBeCloseTo(expected, 10);
            }
        });

        it('производная dP(2,0) должна соответствовать аналитической формуле', () => {
            const thetas = [Math.PI / 6, Math.PI / 4, Math.PI / 3];
            for (const theta of thetas) {
                const result = computeLegendre(theta, 2);
                const cos = Math.cos(theta);
                const sin = Math.sin(theta);
                const expected = -3 * cos * sin;
                expect(getValue(result.dP, 2, 0)).toBeCloseTo(expected, 10);
            }
        });

        it('соответствует опорным значениям для theta = pi/3', () => {
            const result = computeLegendre(Math.PI / 3, 3);

            expect(getValue(result.P, 3, 2)).toBeCloseTo(0.726184, 4);
            expect(getValue(result.dP, 3, 2)).toBeCloseTo(-0.419263, 4);

            expect(getValue(result.P, 2, 0)).toBeCloseTo(-0.125000, 5);
            expect(getValue(result.dP, 2, 0)).toBeCloseTo(-1.299038, 5);
        });

        it('все значения P и dP должны быть конечными числами', () => {
            const result = computeLegendre(Math.PI / 3, maxN);
            for (let n = 0; n <= maxN; n++) {
                for (let m = 0; m <= n; m++) {
                    expect(Number.isFinite(getValue(result.P, n, m))).toBe(true);
                    expect(Number.isFinite(getValue(result.dP, n, m))).toBe(true);
                }
            }
        });

        it('результат не должен содержать NaN', () => {
            const result = computeLegendre(Math.PI / 5, maxN);
            for (let n = 0; n <= maxN; n++) {
                for (let m = 0; m <= n; m++) {
                    expect(getValue(result.P, n, m)).not.toBeNaN();
                    expect(getValue(result.dP, n, m)).not.toBeNaN();
                }
            }
        });
    });

    describe('Структура возвращаемых данных', () => {
        it('размеры массивов P и dP должны быть (maxN+1) x (n+1)', () => {
            const result = computeLegendre(Math.PI / 6, maxN);
            expect(result.P.length).toBe(maxN + 1);
            expect(result.dP.length).toBe(maxN + 1);

            for (let n = 0; n <= maxN; n++) {
                const rowP = result.P[n];
                const rowDP = result.dP[n];
                if (!rowP || !rowDP) {
                    throw new Error(`Отсутствует строка n=${n}`);
                }
                expect(rowP.length).toBe(n + 1);
                expect(rowDP.length).toBe(n + 1);
            }
        });

        it('обе матрицы должны быть разными объектами в памяти', () => {
            const result = computeLegendre(Math.PI / 4, 5);
            expect(result.P).not.toBe(result.dP);
            const rowP0 = result.P[0];
            const rowDP0 = result.dP[0];
            if (!rowP0 || !rowDP0) {
                throw new Error('Отсутствуют строки');
            }
            rowP0[0] = 999;
            expect(rowDP0[0]).not.toBe(999);
        });
    });

    describe('Обработка исключений', () => {
        it('должен выбрасывать контролируемую ошибку при maxN < 0', () => {
            expect(() => computeLegendre(Math.PI / 4, -1)).toThrow(
                'Максимальная степень maxN не может быть отрицательной'
            );
        });

        it('не должен падать при theta за пределами [0, pi]', () => {
            expect(() => computeLegendre(-0.5, 3)).not.toThrow();
            expect(() => computeLegendre(Math.PI + 1, 3)).not.toThrow();
        });

        it('не должен падать при очень маленьком theta', () => {
            expect(() => computeLegendre(1e-12, 13)).not.toThrow();
        });

        it('не должен падать при theta очень близком к pi', () => {
            expect(() => computeLegendre(Math.PI - 1e-12, 13)).not.toThrow();
        });
    });
});