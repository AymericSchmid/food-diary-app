import Image from "next/image"

import { RecognitionResult, SegmentationResponse } from "@/lib/logmeal/types"
import { getBoxColor } from "@/lib/utils/box-colors"

type Props = {
    previewUrl: string
    result: SegmentationResponse
    selectedFoods: Record<number, RecognitionResult>
}

export default function PhotoBoundingBoxPreview({ previewUrl, result, selectedFoods }: Props) {
    const imageWidth = result.processed_image_size?.width
    const imageHeight = result.processed_image_size?.height

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Detected regions</p>

            <div className="relative w-full overflow-hidden rounded-xl border bg-muted" 
                style={{aspectRatio: imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : undefined}}>
                <Image
                    src={previewUrl}
                    alt="Meal with detected food regions"
                    fill
                    unoptimized
                    className="object-fill"
                />

                {imageWidth && imageHeight && result.segmentation_results?.map((segment, index) => {
                    const box = segment.contained_bbox

                    if (!box || !selectedFoods[index]) return null

                    const left = (box.x / imageWidth) * 100
                    const top = (box.y / imageHeight) * 100
                    const width = (box.w / imageWidth) * 100
                    const height = (box.h / imageHeight) * 100

                    const color = getBoxColor(index)

                    return (
                        <div
                            key={index}
                            className="absolute rounded-md border-2"
                            style={{
                                borderColor: color.border,
                                backgroundColor: color.background,
                                borderWidth: "2px",
                                left: `${left}%`,
                                top: `${top}%`,
                                width: `${width}%`,
                                height: `${height}%`,
                            }}
                        />
                    )
                })}
            </div>
        </div> 
    )
}