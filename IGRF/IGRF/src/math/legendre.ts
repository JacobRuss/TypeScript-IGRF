interface LegendreResult {
    P: number[][];
    dP: number[][];
}


function getMatrixValue(matrix: number[][], n: number, m: number, name: string): number {
    const row = matrix[n];
    if (!row) {
        throw new Error(`Ошибка расчета: Строка ${n} в матрице ${name} еще не создана.`);
    }
    const value = row[m];
    if (value === undefined) {
        throw new Error(`Ошибка расчета: Элемент ${name}(${n},${m}) не определен.`);
    }
    return value;
}


function computeLegendre(theta: number, maxN: number): LegendreResult {

    if (maxN < 0) {
        throw new Error("Максимальная степень maxN не может быть отрицательной");
    }

    const P: number[][] = [];
    const dP: number[][] = [];
    const sin = Math.sin(theta);
    const cos = Math.cos(theta);

   
    for (let n = 0; n <= maxN; n++) {
        P[n] = new Array(n + 1).fill(0);
        dP[n] = new Array(n + 1).fill(0);
    }

    
    const rowP0 = P[0];
    const rowDP0 = dP[0];
    if (!rowP0 || !rowDP0) {
        throw new Error("Ошибка инициализации базовых массивов для n=0");
    }
    rowP0[0] = 1.0;
    rowDP0[0] = 0.0;

    for (let n = 1; n <= maxN; n++) {
        const rowP = P[n];
        const rowDP = dP[n];
        if (!rowP || !rowDP) {
            throw new Error(`Ошибка инициализации строк для степени n=${n}`);
        }

       
        // Случай 1: m = n (Движение по диагонали матрицы)
        
        const P_prev_diag = getMatrixValue(P, n - 1, n - 1, "P");
        const dP_prev_diag = getMatrixValue(dP, n - 1, n - 1, "dP");

        // Для n = 1 шмидтовский фактор равен 1.0. Для n > 1 применяется корень
        const diagFactor = n === 1 ? 1.0 : Math.sqrt((2 * n - 1) / (2 * n));

        rowP[n] = sin * P_prev_diag * diagFactor;
        rowDP[n] = (cos * P_prev_diag + sin * dP_prev_diag) * diagFactor;

     
        // Случай 2: m = n - 1 (Первая поддиагональ)
       
        const subFactor = Math.sqrt(2 * n - 1);

        rowP[n - 1] = cos * P_prev_diag * subFactor;
        rowDP[n - 1] = (cos * dP_prev_diag - sin * P_prev_diag) * subFactor;

       
        // Случай 3: Основная рекурсия (m < n - 1)
       
        for (let m = 0; m <= n - 2; m++) {
            const P_n1 = getMatrixValue(P, n - 1, m, "P");
            const P_n2 = getMatrixValue(P, n - 2, m, "P");
            const dP_n1 = getMatrixValue(dP, n - 1, m, "dP");
            const dP_n2 = getMatrixValue(dP, n - 2, m, "dP");

            let factor1 = 0;
            let factor2 = 0;

            if (m === 0) {
                // Зональные гармоники (m = 0). Множитель Шмидта равен 1.
                factor1 = (2 * n - 1) / n;
                factor2 = (n - 1) / n;
            } else {
                // Тессеральные гармоники (m > 0).
                factor1 = Math.sqrt((4 * n * n - 1) / (n * n - m * m));
                factor2 = Math.sqrt(((n - 1) * (n - 1) - m * m) / (n * n - m * m) * ((2 * n + 1) / (2 * n - 3)));
            }

            // Вычисление итогового полинома и производной
            rowP[m] = cos * P_n1 * factor1 - P_n2 * factor2;
            rowDP[m] = (cos * dP_n1 - sin * P_n1) * factor1 - dP_n2 * factor2;
        }
    }

    return { P, dP };
}

export { computeLegendre };
export type { LegendreResult };
