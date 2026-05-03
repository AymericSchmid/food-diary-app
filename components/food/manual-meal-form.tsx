"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { extractEnergyKcal } from "@/lib/logmeal/nutrition"
import { Ingredient, ManualItem, UnitType } from "@/lib/utils/food"
import { createLocalId } from "@/lib/utils/id"
import MealDetailsCard from "./meal-details-card"
import IngredientSearch from "./ingredient-search"
import SelectedIngredientsCard from "./selected-ingredients-card"

export default function ManualMealForm() {
    const router = useRouter()
    const supabase = createClient()

    const [mealName, setMealName] = useState("")
    const [openCalendar, setOpenCalendar] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [ingredientName, setIngredientName] = useState("")
    const [amount, setAmount] = useState("")
    const [items, setItems] = useState<ManualItem[]>([])
    const [unit, setUnit] = useState<UnitType>("g")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([])
    const [loadingIngredients, setLoadingIngredients] = useState(true)
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)

    useEffect(() => {
        async function fetchIngredients() {
            try {
                const response = await fetch("/api/logmeal/ingredients")
                const data = await response.json()
                const list = data

                setIngredients(list)
            } catch (error) {
                console.error("Error fetching ingredients:", error)
            } finally {
                setLoadingIngredients(false)
            }
        }

        fetchIngredients()
    }, [])

    useEffect(() => {
        if (!ingredientName.trim() || selectedIngredient) {
            setFilteredIngredients([])
            return
        }

        const search = ingredientName.toLowerCase()
        console.log("Searching for:", search)
        const results = ingredients
            .filter((item) => item.name.toLowerCase().includes(search))
            .slice(0, 8)

        setFilteredIngredients(results)
    }, [ingredientName, ingredients])

    function handleSelectIngredient(ingredient: Ingredient) {
        setSelectedIngredient(ingredient)
        setFilteredIngredients([])
        setIngredientName(ingredient.name)

        setAmount(String(Number(ingredient.avgQuantity).toFixed(0)))
        setUnit(ingredient.unit)
    }

    async function handleAddIngredient() {
        setError("")

        if (!selectedIngredient) {
            setError("Please select an ingredient from the list")
            return
        }

        if (!amount) {
            setError("Please enter an amount")
            return
        }

        if(isNaN(Number(amount))) {
            setError("Amount must be a valid number")
            return
        }

        setLoading(true)

        try {
            const response = await fetch("/api/logmeal/compute-nutrients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ingredient_list: [
                        {
                            ingredientId: selectedIngredient.id,
                            ingredientAmount: Number(amount)
                        },
                    ],
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Failed to compute nutrients for the ingredient")
                setLoading(false)
                return
            }

            const energyKcal = extractEnergyKcal(data)

            const newItem: ManualItem = {
                id: createLocalId(),
                logmeal_id: selectedIngredient.id,
                name: selectedIngredient.name,
                amount: Number(amount),
                unit,
                energy_kcal: energyKcal,
            }

            setItems((current) => [...current, newItem])

            setSelectedIngredient(null)
            setIngredientName("")
            setAmount("")
            setUnit("g")
        } catch (error) {
            setError("An error occurred while adding the ingredient")
        } finally {
            setLoading(false)
        }
    }
    
    function removeIngredient(id: string) {
        setItems((current) => current.filter((item) => item.id !== id))
    }
    
    function handleSelectedDate(selectedDate: Date) {
        if (!selectedDate) return
        const previousDate = date ?? new Date()
        selectedDate.setHours(previousDate.getHours(), previousDate.getMinutes(), 0, 0)
        setDate(selectedDate)
        setOpenCalendar(false)
    }
    
    function handleSelectedTime(selectedTime: string) {
        const currentDate = date ?? new Date()
        const [hours, minutes] = selectedTime.split(":").map(Number)
        const updatedDate = new Date(currentDate)
        updatedDate.setHours(hours, minutes, 0, 0)
        setDate(updatedDate)
    }
    
    async function handleSaveMeal() {
        setError("")

        if (!mealName.trim()) {
            setError("Please enter a meal name")
            return
        }

        if (items.length === 0) {
            setError("Please add at least one ingredient")
            return
        }

        if (!date) {
            setError("Please select a date and time")
            return
        }

        setLoading(true)

        const totalEnergy = items.reduce((total, item) => total + (item.energy_kcal || 0), 0)

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setLoading(false)
            setError("Failed to get user information")
            return
        }

        const { data: meal, error: mealError } = await supabase
            .from("diary_entries")
            .insert({
            user_id: user.id,
            meal_name: mealName.trim(),
            entry_type: "manual",
            total_energy_kcal: totalEnergy,
            logged_at: date.toISOString(),
            })
            .select("id")
            .single()
        
        if (mealError || !meal) {
            setLoading(false)
            setError("Failed to save meal")
            return
        }

        const itemsToInsert = items.map((item) => ({
            diary_entry_id: meal.id,
            name: item.name,
            amount: item.amount,
            unit: item.unit,
            logmeal_id: item.logmeal_id,
            energy_kcal: item.energy_kcal || 0,
        }))

        const { error: itemsError } = await supabase
            .from("diary_items")
            .insert(itemsToInsert)

        if (itemsError) {
            setLoading(false)
            setError(itemsError.message)
            return
        }

        setLoading(false)
        router.push("/diary")
        router.refresh()
    }

    function everythingValid() {
        return mealName.trim() && items.length > 0 && date
    }

    return (
        <section className="space-y-4 pb-24">
            <div>
                <h2 className="text-2xl font-bold">Manual meal</h2>
                <p className="text-muted-foreground">
                    Add ingredients and build your meal entry.
                </p>
            </div>
        
            <MealDetailsCard 
                mealName={mealName}
                setMealName={setMealName}
                date={date}
                openCalendar={openCalendar}
                setOpenCalendar={setOpenCalendar}
                onSelectDate={handleSelectedDate}
                onSelectTime={handleSelectedTime}
            />
            
            <IngredientSearch 
                ingredientName={ingredientName}
                setIngredientName={setIngredientName}
                amount={amount}
                setAmount={setAmount}
                unit={unit}
                filteredIngredients={filteredIngredients}
                onSelectIngredient={handleSelectIngredient}
                onAddIngredient={handleAddIngredient}
                setSelectedIngredient={setSelectedIngredient}
                error={error}
                loading={loading}
            />
            
            <SelectedIngredientsCard
                items={items}
                onRemoveIngredient={removeIngredient}
            />
            
            <div className="fixed bottom-16 left-1/2 w-full max-w-sm -translate-x-1/2 bg-background p-4">
                <Button className="w-full" size="lg" disabled={!everythingValid() || loading} onClick={handleSaveMeal}>
                      {loading ? "Saving..." : "Save to diary"}
                </Button>
            </div>
        </section>
    )
}