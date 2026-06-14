import type { PSICalculationDetail } from "@/types";

export function calculatePSI(
  matrix: number[][],
  criteriaTypes: ("benefit" | "cost")[],
): PSICalculationDetail {
  const m = matrix.length;
  const n = criteriaTypes.length;

  if (m === 0 || n === 0) {
    return {
      normalizedMatrix: [],
      meanValues: [],
      preferenceVariation: [],
      deviationPreference: [],
      overallPreference: [],
      psiScores: [],
    };
  }

  const normalized: number[][] = Array.from({ length: m }, () => Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    const column = matrix.map((row) => row[j]);
    const maxVal = Math.max(...column);
    const minVal = Math.min(...column);

    for (let i = 0; i < m; i++) {
      if (criteriaTypes[j] === "benefit") {
        normalized[i][j] = matrix[i][j] / maxVal;
      } else {
        normalized[i][j] = minVal / matrix[i][j];
      }
    }
  }

  const meanValues: number[] = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    meanValues[j] = normalized.reduce((sum, row) => sum + row[j], 0) / m;
  }

  const preferenceVariation: number[] = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    preferenceVariation[j] = normalized.reduce(
      (sum, row) => sum + Math.pow(row[j] - meanValues[j], 2),
      0,
    );
  }

  let deviationPreference = preferenceVariation.map((pv) => 1 - pv);

  const sumDPV = deviationPreference.reduce((a, b) => a + b, 0);
  let overallPreference: number[];
  if (sumDPV === 0) {
    overallPreference = deviationPreference.map(() => 1 / deviationPreference.length);
  } else {
    overallPreference = deviationPreference.map((dpv) => dpv / sumDPV);
  }

  const psiScores: number[] = Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    psiScores[i] = normalized[i].reduce(
      (sum, rij, j) => sum + overallPreference[j] * rij,
      0,
    );
  }

  return {
    normalizedMatrix: normalized,
    meanValues,
    preferenceVariation,
    deviationPreference,
    overallPreference,
    psiScores,
  };
}
