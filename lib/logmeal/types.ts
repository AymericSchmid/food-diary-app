export type FoodType = {
    id: number
    name: string
}

export type BoundingBox = {
    x: number
    y: number
    w: number
    h: number
}

export type ProcessedImageSize = {
    width: number
    height: number
}

export type RecognitionResult = {
    id: number
    name: string
    prob: number
    foodType?: FoodType
}

export type SegmentationResult = {
    contained_bbox?: BoundingBox
    recognition_results: RecognitionResult[]
}

export type SegmentationResponse = {
    imageId: number
    occasion?: string
    processed_image_size?: ProcessedImageSize
    segmentation_results?: SegmentationResult[]
}

export type PhotoNutritionItem = {
    food_item_position: number
    logmeal_id: number
    name: string
    baseServing: number
    serving: number
    unit: string
    baseKcal: number
}