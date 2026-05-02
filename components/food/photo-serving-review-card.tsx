import { adjustedKcal } from "@/lib/logmeal/nutrition"
import { PhotoNutritionItem } from "@/lib/logmeal/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "../ui/separator"

type Props = {
    items: PhotoNutritionItem[]
    setItems: React.Dispatch<React.SetStateAction<PhotoNutritionItem[]>>
    onSave: () => void
    onCancel: () => void
    loading: boolean
}

export default function PhotoServingReviewCard({ items, setItems, onSave, onCancel, loading }: Props) {
    const totalKcal = items.reduce((total, item) => total + adjustedKcal(item), 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Review servings</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {items.map((item, index) => (
                    <div key={item.food_item_position} className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-medium capitalize">{item.name}</p>
                            </div>

                            <p className="font-semibold">
                                {adjustedKcal(item).toFixed(0)} kcal
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Serving size</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={item.serving.toFixed(0)}
                                    onChange={(e) => {
                                        const value = Number(e.target.value)

                                        setItems((current) =>
                                            current.map((currentItem) =>
                                                currentItem.food_item_position === item.food_item_position ? { ...currentItem, serving: value } : currentItem
                                        )
                                    )}}
                                />

                                <span className="w-8 text-sm text-muted-foreground">
                                    {item.unit}
                                </span>
                            </div>
                        </div>

                        {index < items.length - 1 && <Separator />}
                    </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                        {totalKcal.toFixed(0)} kcal
                    </span>
                </div>


                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="lg" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button size="lg" onClick={onSave} disabled={loading}>
                        {loading ? "Saving..." : "Save photo meal"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}