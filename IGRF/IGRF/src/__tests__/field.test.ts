import { calculateField } from '../math/field';
import { geodeticToSpherical } from '../math/coordinates';

describe('calculateField', () => {
  const year = 2020;

  it('F должен вычисляться из X, Y, Z', () => {
    const { theta, phi, r } = geodeticToSpherical(55.75, 37.62, 0);
    const result = calculateField(theta, phi, r, year);
    const computedF = Math.sqrt(result.X ** 2 + result.Y ** 2 + result.Z ** 2);
    expect(result.F).toBeCloseTo(computedF, 5);
  });

  it('на северном полюсе Y должен быть близок к нулю', () => {
    const { theta, phi, r } = geodeticToSpherical(90, 0, 0);
    const result = calculateField(theta, phi, r, year);
    expect(Math.abs(result.Y)).toBeLessThan(200);
  });

  it('на северном полюсе |Z| должен быть большим', () => {
    const { theta, phi, r } = geodeticToSpherical(90, 0, 0);
    const result = calculateField(theta, phi, r, year);
    expect(Math.abs(result.Z)).toBeGreaterThan(40000);
  });

  it('на северном полюсе |Z| должен быть близок к дипольному приближению', () => {
    const { theta, phi, r } = geodeticToSpherical(90, 0, 0);
    const result = calculateField(theta, phi, r, year);
    expect(Math.abs(result.Z)).toBeLessThan(58810);
    expect(Math.abs(result.Z)).toBeGreaterThan(56000);
  });

  it('на экваторе поле должно быть в разумных пределах', () => {
    const { theta, phi, r } = geodeticToSpherical(0, 0, 0);
    const result = calculateField(theta, phi, r, year);
    expect(result.F).toBeGreaterThan(25000);
    expect(result.F).toBeLessThan(45000);
  });

  it('результат должен быть конечным для разных лет', () => {
    for (const y of [1900, 1950, 2000, 2020, 2025, 2030]) {
      const { theta, phi, r } = geodeticToSpherical(0, 0, 0);
      const result = calculateField(theta, phi, r, y);
      expect(Number.isFinite(result.X)).toBe(true);
      expect(Number.isFinite(result.Y)).toBe(true);
      expect(Number.isFinite(result.Z)).toBe(true);
      expect(Number.isFinite(result.F)).toBe(true);
    }
  });

    describe('сверка с независимой реализацией (IGRF-14, геоцентрические компоненты)', () => {
    // [lat, lon, h_km, year, X, Y, Z, F] — X на север, Y на восток, Z вниз, нТл
    const REFERENCE: Array<[number, number, number, number, number, number, number, number]> = [
      [55.75, 37.62, 0, 2020, 16193.85, 3301.157, 50042.511, 52700.961],
      [-25, -45, 300, 2020, 14579.195, -5333.514, -13176.124, 20361.963],
      [0, 0, 0, 2025, 27456.622, -1926.549, -15997.353, 31835.404],
      [60, 0, 0, 1950, 14222.808, -2703.101, 46948.016, 49129.535],
      [-90, 0, 0, 2020, 14430.892, -8568.327, -52025.281, 54665.316],
      [89.5, 120, 0, 2025, -1136.275, 1202.136, 56942.492, 56966.513],
    ];

    it.each(REFERENCE)('lat=%f lon=%f h=%f год=%i', (lat, lon, h, y, X, Y, Z, F) => {
      const { theta, phi, r } = geodeticToSpherical(lat, lon, h);
      const result = calculateField(theta, phi, r, y);
      expect(result.X).toBeCloseTo(X, 2);
      expect(result.Y).toBeCloseTo(Y, 2);
      expect(result.Z).toBeCloseTo(Z, 2);
      expect(result.F).toBeCloseTo(F, 2);
    });
  });
});