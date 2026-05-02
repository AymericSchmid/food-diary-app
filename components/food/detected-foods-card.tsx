import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBoxColor } from "@/lib/utils/box-colors"
import { SegmentationResponse, RecognitionResult } from "@/lib/logmeal/types"

type Props = {
    result: SegmentationResponse
    selectedFoods: Record<number, RecognitionResult>
    setSelectedFoods: React.Dispatch<React.SetStateAction<Record<number, RecognitionResult>>>
    onRemoveFood: (position: number) => void
    onConfirmFoods: () => void
    loading: boolean
}

export default function DetectedFoodsCard({ result, selectedFoods, setSelectedFoods, onRemoveFood, onConfirmFoods, loading }: Props) {
    const detectedCount = Object.keys(selectedFoods).length
    const visibleSegments = result.segmentation_results
        ?.map((segment, segmentIndex) => ({ segment, segmentIndex, }))
        .filter(({ segmentIndex }) => selectedFoods[segmentIndex]) ?? []

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle>Detected foods</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Confirm the best match for each detected item.
                        </p>
                    </div>

                    <Badge variant="secondary">
                        {detectedCount} item{detectedCount !== 1 ? "s" : ""}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">

                {visibleSegments.map(({segment, segmentIndex}, visibleIndex) => {
                    // if there's no recognition result for this segment => it has been removed by the user
                    if (!selectedFoods[segmentIndex]) return null
                    
                    const candidates = segment.recognition_results ?? []
                    const selectedFood = selectedFoods[segmentIndex]

                    const color = getBoxColor(segmentIndex)

                    return (
                        <div key={segmentIndex} className="space-y-3">
                            {/* the border has to be defined as a style, otherwise it doesn't appear on iphone */}
                            <div className="rounded-xl border-l-4 p-3" style={{ borderLeft: `4px solid ${color.border}`, }}>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-sm">
                                        Food item {segmentIndex + 1}
                                    </p>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-600"
                                        onClick={() => onRemoveFood(segmentIndex)}
                                        hidden={visibleSegments.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Select
                                    value={selectedFood ? String(selectedFood.id) : ""}
                                    onValueChange={(value) => {
                                        const candidate = candidates.find((item) => String(item.id) === value)
                                        if (!candidate) return

                                        setSelectedFoods((current) => ({
                                            ...current,
                                            [segmentIndex]: candidate,
                                        }))
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose detected food" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {candidates.slice(0, 5).map((candidate) => (
                                            <SelectItem key={candidate.id} value={String(candidate.id)}>
                                                {candidate.name} · {(candidate.prob * 100).toFixed(0)}%
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {visibleIndex < visibleSegments.length - 1 && <Separator />}
                        </div>
                    )
                })}

                <Button
                    className="w-full"
                    size="lg"
                    disabled={detectedCount === 0 || loading}
                    onClick={onConfirmFoods}
                >
                    Confirm selected foods
                </Button>
            </CardContent>
        </Card>
    )
}