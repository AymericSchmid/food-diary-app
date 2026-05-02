export function calculateBmi(weightKg: number, heightCm: number) {
    if (!weightKg || !heightCm) return null

    const heightM = heightCm / 100

    if (heightM <= 0) return null

    return Number((weightKg / (heightM * heightM)).toFixed(1))
}

export function getBmiCategory(bmi: number | null) {
    if (!bmi) return null

    if (bmi < 18.5) return "Underweight"
    if (bmi < 25) return "Normal weight"
    if (bmi < 30) return "Overweight"

    return "Obesity"
}