import { RecognitionResult, SegmentationResponse, SegmentationResult, } from "@/lib/logmeal/types"

export function getDefaultSelectedFoods(result: SegmentationResponse): Record<number, RecognitionResult> {
    const defaultSelections: Record<number, RecognitionResult> = {}

    result.segmentation_results?.forEach((segment: SegmentationResult, index: number) => {
        const firstCandidate = segment.recognition_results?.[0]
        
        if (firstCandidate) {
            defaultSelections[index] = firstCandidate
        }
    })
    return defaultSelections
}