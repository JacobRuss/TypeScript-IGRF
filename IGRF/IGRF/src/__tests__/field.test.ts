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
    for (const y of [1900, 1950, 2000, 2020]) {
      const { theta, phi, r } = geodeticToSpherical(0, 0, 0);
      const result = calculateField(theta, phi, r, y);
      expect(Number.isFinite(result.X)).toBe(true);
      expect(Number.isFinite(result.Y)).toBe(true);
      expect(Number.isFinite(result.Z)).toBe(true);
      expect(Number.isFinite(result.F)).toBe(true);
    }
  });
});