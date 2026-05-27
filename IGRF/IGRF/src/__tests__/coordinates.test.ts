import { geodeticToSpherical } from '../math/coordinates';

function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

describe('Преобразование координат', () => {
    it('на северном полюсе theta должен быть 0', () => {
        const result = geodeticToSpherical(90, 0, 0);
        expect(result.theta).toBeCloseTo(0, 5);
        expect(result.r).toBeCloseTo(6356.752, 0);
    });

    it('на южном полюсе theta должен быть pi', () => {
        const result = geodeticToSpherical(-90, 0, 0);
        expect(result.theta).toBeCloseTo(Math.PI, 5);
    });

    it('на экваторе theta должен быть pi/2', () => {
        const result = geodeticToSpherical(0, 0, 0);
        expect(result.theta).toBeCloseTo(Math.PI / 2, 5);
    });

    it('долгота не должна меняться при преобразовании', () => {
        const lons = [0, 45, -90, 180, -123.456];
        for (const lon of lons) {
            const result = geodeticToSpherical(0, lon, 0);
            expect(result.phi).toBeCloseTo(degToRad(lon), 5);
        }
    });

    it('высота должна увеличивать r', () => {
        const atSurface = geodeticToSpherical(0, 0, 0);
        const atHeight = geodeticToSpherical(0, 0, 100);
        expect(atHeight.r).toBeGreaterThan(atSurface.r);
        expect(atHeight.r - atSurface.r).toBeCloseTo(100, 0);
    });

    it('геоцентрическая широта отличается от геодезической', () => {
        const result = geodeticToSpherical(45, 0, 0);
        const geocentricLat = Math.PI / 2 - result.theta;
        expect(geocentricLat).not.toBeCloseTo(degToRad(45), 5);
        expect(geocentricLat).toBeLessThan(degToRad(45));
    });

    it('на полюсах долгота не влияет на theta и r', () => {
        const atNorth0 = geodeticToSpherical(90, 0, 0);
        const atNorth180 = geodeticToSpherical(90, 180, 0);
        expect(atNorth0.theta).toBeCloseTo(atNorth180.theta, 5);
        expect(atNorth0.r).toBeCloseTo(atNorth180.r, 5);
    });

    it('результат должен быть конечным для любых координат', () => {
        const cases: Array<[number, number, number]> = [
            [0, 0, 0],
            [90, 0, 0],
            [-90, 0, 0],
            [45, 180, 1000],
            [-45, -180, -10],
        ];
        for (const [lat, lon, h] of cases) {
            const result = geodeticToSpherical(lat, lon, h);
            expect(Number.isFinite(result.theta)).toBe(true);
            expect(Number.isFinite(result.phi)).toBe(true);
            expect(Number.isFinite(result.r)).toBe(true);
        }
    });

    it('Москва (55.75°N, 37.62°E, 150 км) — все три координаты', () => {
        const result = geodeticToSpherical(55.75, 37.62, 150);
        expect(result.theta).toBeCloseTo(degToRad(34.4251), 4);
        expect(result.phi).toBeCloseTo(degToRad(37.62), 5);
        expect(result.r).toBeCloseTo(6513.564, 3);
    });

    it('Южно-Атлантическая аномалия (25°S, 45°W, 300 км) — все три координаты', () => {
        const result = geodeticToSpherical(-25, -45, 300);
        expect(result.theta).toBeGreaterThan(Math.PI / 2);
        expect(result.theta).toBeCloseTo(degToRad(114.8595), 4);
        expect(result.phi).toBeCloseTo(degToRad(-45), 5);
        expect(result.r).toBeCloseTo(6674.343, 3);
    });
});