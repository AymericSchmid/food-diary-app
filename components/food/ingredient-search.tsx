import { Ingredient, UnitType } from "@/lib/utils/food"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Plus } from "lucide-react"
import { Button } from "../ui/button"

type Props = {
    ingredientName: string
    setIngredientName: (value: string) => void
    amount: string
    setAmount: (value: string) => void
    unit: UnitType
    setUnit: (value: UnitType) => void
    filteredIngredients: Ingredient[]
    onSelectIngredient: (ingredient: Ingredient) => void
    onAddIngredient: () => void
    setSelectedIngredient: (ingredient: Ingredient | null) => void
    error: string
    loading: boolean
}

export default function IngredientSearch({
    ingredientName,
    setIngredientName,
    amount,
    setAmount,
    unit,
    setUnit,
    filteredIngredients,
    onSelectIngredient,
    onAddIngredient,
    setSelectedIngredient,
    error,
    loading,
}: Props) {
    return (
        <Card className="overflow-visible">
            <CardHeader>
                <CardTitle>Ingredients</CardTitle>
            </CardHeader>
        
            <CardContent className="space-y-3" >
                <div className="space-y-2 relative">
                    <Label htmlFor="ingredient-name">Ingredient</Label>
                    <Input
                        id="ingredient-name"
                        placeholder="Search ingredient..."
                        value={ingredientName}
                        onChange={(e) => {
                            setIngredientName(e.target.value)
                            setSelectedIngredient(null)
                        }}
                    />

                    {filteredIngredients.length > 0 && (
                        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-background shadow-md">
                            {filteredIngredients.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                    onClick={() => onSelectIngredient(item)}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
        
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                        id="amount"
                        placeholder="100"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Unit</Label>

                        <Select
                            value={unit}
                            onValueChange={(value: UnitType) => setUnit(value)}
                        >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="serving">serving</SelectItem>
                            <SelectItem value="piece">piece</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                </div>
        
                <div className="full-width">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
        
                <Button variant="secondary" className="w-full" onClick={onAddIngredient} disabled={loading}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add ingredient
                </Button>
            </CardContent>
        </Card>
    )
}