import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { formatNumber } from "@/lib/utils/format"
import { ManualItem } from "@/lib/utils/food"

type Props = {
    items: ManualItem[]
    onRemoveIngredient: (id: string) => void
}

export default function SelectedIngredientsCard({ items, onRemoveIngredient }: Props) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Selected ingredients</CardTitle>
            </CardHeader>
        
            <CardContent>
                {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ingredients added yet.</p>
                ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatNumber(item.amount)} {item.unit} - {formatNumber(item.energy_kcal || 0)} kcal
                                </p>
                            
                                <Button variant="ghost" size="icon" onClick={() => onRemoveIngredient(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Separator />
                        </div>
                    ))}
                
                    <div className="flex items-center justify-between pt-2">
                        <span className="font-semibold">Total:</span>
                        <span className="text-2xl font-bold">
                            {formatNumber(items.reduce((total, item) => total + (item.energy_kcal || 0), 0))} kcal
                        </span>
                    </div>
                </div>
            )}
            </CardContent>
        </Card>
    )
}