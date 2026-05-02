import { PhotoNutritionItem, RecognitionResult } from "@/lib/logmeal/types"
import { inferUnitFromFood } from "./units"

export function extractEnergyKcal(data: any): number {
    const nutrients = data.computed_nutrients ?? []

    const energy = nutrients.find(
        (item: any) => item.indicatorCode === "ENERC_KCAL"
    )

    return Number(energy?.indicatorAmount ?? 0)
}

export function buildPhotoNutritionItems(
    data: any,
    selectedFoods: Record<number, RecognitionResult>
): PhotoNutritionItem[] {
    return data.nutritional_info_per_item
        .filter((item: any) => {
            const segmentIndex = item.food_item_position - 1
            return Boolean(selectedFoods[segmentIndex])
        })
        .map((item: any) => {
            const segmentIndex = item.food_item_position - 1
            const selectedFood = selectedFoods[segmentIndex]

            const name = selectedFood?.name ?? data.foodName?.[segmentIndex] ?? `Food item ${item.food_item_position}`

            const serving = Number(item.serving_size ?? 0)
            const calories = Number(item.nutritional_info?.calories ?? 0)

        return {
            food_item_position: item.food_item_position,
            name,
            logmeal_id: item.id,
            baseServing: serving,
            serving,
            unit: inferUnitFromFood(selectedFood),
            baseKcal: calories,
        }
    })
}

export function adjustedKcal(item: PhotoNutritionItem) {
    return (item.baseKcal / item.baseServing) * item.serving
}