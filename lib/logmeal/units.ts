import { RecognitionResult } from "@/lib/logmeal/types"

export function inferUnitFromFood(food?: RecognitionResult): "g" | "ml" {
    if (!food) return "g"

    if (food.foodType?.name === "drinks") {
        return "ml"
    }

    return "g"
}