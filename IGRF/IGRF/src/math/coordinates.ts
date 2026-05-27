interface SphericalCoordinates {
    theta: number;
    phi: number;
    r: number;
}

function geodeticToSpherical(
    lat: number,
    lon: number,
    h: number
): SphericalCoordinates {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    const a = 6378.137;
    const f = 1 / 298.257223563;
    const e2 = 2 * f - f * f;

    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);

    const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);

    const x = (N + h) * cosLat * Math.cos(lonRad);
    const y = (N + h) * cosLat * Math.sin(lonRad);
    const z = ((1 - e2) * N + h) * sinLat;

    const r = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.acos(z / r);
    const phi = lonRad;

    return { theta, phi, r };
}

export { geodeticToSpherical };
export type { SphericalCoordinates };