import { geodeticToSpherical } from '../math/coordinates';
import { calculateField } from '../math/field';

const { theta, phi, r } = geodeticToSpherical(55.75, 37.62, 0);
const field = calculateField(theta, phi, r, 2020);

const app = document.getElementById('app');
if (app !== null) {
    app.textContent =
        `Москва, 2020 год: ` +
        `X = ${field.X.toFixed(0)}, Y = ${field.Y.toFixed(0)}, ` +
        `Z = ${field.Z.toFixed(0)}, F = ${field.F.toFixed(0)} нТл`;
}