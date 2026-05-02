import { Camera, ImagePlus, Loader2, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import PhotoBoundingBoxPreview from "@/components/food/photo-bounding-box-preview"
import { RecognitionResult } from "@/lib/logmeal/types"
import { SegmentationResponse } from "@/lib/logmeal/types"

type Props = {
    previewUrl: string | null
    loading: boolean
    error: string
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onAnalyzeImage: () => void
    onResetPhoto: () => void
    disableAnalyze: boolean
    segmentationResult?: SegmentationResponse | null
    selectedFoods: Record<number, RecognitionResult>
}

export default function PhotoUploadCard({
    previewUrl,
    loading,
    error,
    onImageChange,
    onAnalyzeImage,
    onResetPhoto,
    disableAnalyze,
    segmentationResult,
    selectedFoods
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Meal photo</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {!previewUrl ? (
                    <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center hover:bg-muted/40">
                        <ImagePlus className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="font-medium">Choose a photo</p>
                        <p className="text-sm text-muted-foreground">
                            Select from gallery or take a new picture.
                        </p>

                        <Input
                            type="file"
                            accept="image/*,.heic,.heif"
                            className="hidden"
                            onChange={onImageChange}
                        />
                    </label>
                ) : (
                    <div className="space-y-3">
                        {segmentationResult ? (
                            <PhotoBoundingBoxPreview
                                previewUrl={previewUrl}
                                result={segmentationResult}
                                selectedFoods={selectedFoods}
                            />
                        ) : (
                            <div className="overflow-hidden rounded-xl border bg-muted">
                                <img
                                    src={previewUrl}
                                    alt="Meal preview"
                                    className="h-auto w-full"
                                />
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                onClick={onAnalyzeImage}
                                disabled={loading || disableAnalyze}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="mr-2 h-4 w-4" />
                                        Analyze photo
                                    </>
                                )}
                            </Button>

                            <Button variant="outline" size="icon" onClick={onResetPhoto}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
        </Card>
    )
}