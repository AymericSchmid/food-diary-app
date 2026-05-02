export type UnitType = "g" | "ml" | "serving" | "piece"

export type ManualItem = {
    id: string,
    logmeal_id: number,
    name: string,
    amount: number,
    unit: UnitType,
    energy_kcal: number | null,
}

export type Ingredient = {
    id: number,
    name: string,
    avgQuantity: number,
    unit: UnitType,
    state: string | null,
    modifier_type: string | null,
}