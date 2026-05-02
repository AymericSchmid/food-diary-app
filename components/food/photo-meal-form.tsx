"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { adjustedKcal } from "@/lib/logmeal/nutrition"
import { SegmentationResponse, RecognitionResult, PhotoNutritionItem } from "@/lib/logmeal/types"
import { getDefaultSelectedFoods } from "@/lib/logmeal/photo-food"
import PhotoUploadCard from "@/components/food/photo-upload-card"
import DetectedFoodsCard from "@/components/food/detected-foods-card"
import { buildPhotoNutritionItems } from "@/lib/logmeal/nutrition"
import PhotoServingReviewCard from "@/components/food/photo-serving-review-card"
import MealDetailsCard from "./meal-details-card"
import { uploadMealImage } from "@/lib/supabase/storage"
import { resizeImage } from "@/lib/utils/images"

export default function PhotoMealForm() {
    const router = useRouter()
    const supabase = createClient()

    const [mealName, setMealName] = useState("")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [openCalendar, setOpenCalendar] = useState(false)

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [segmentationResult, setSegmentationResult] = useState<SegmentationResponse | null>(null)
    const [selectedFoods, setSelectedFoods] = useState<Record<number, RecognitionResult>>({})
    const [analyzing, setAnalyzing] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState("")
    const [nutritionItems, setNutritionItems] = useState<PhotoNutritionItem[]>([])
    const [uploadFile, setUploadFile] = useState<File | null>(null)

    async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]

        if (!file) return

        setSegmentationResult(null)
        setError("")
        setSelectedFoods({})
        setNutritionItems([])

        try {
            // the api only accepts jpg, so we convert if needed
            const jpgFile = await resizeImage(file)

            setUploadFile(jpgFile)

            setImageFile(jpgFile)
            setPreviewUrl(URL.createObjectURL(jpgFile))
        } catch (error) {
            setError("Failed to process image" + (error instanceof Error ? ": " + error.message : ""))
        }       
    }

    async function handleAnalyzeImage() {
        if (!imageFile) {
            setError("Please select an image first")
            return
        }

        setAnalyzing(true)
        setError("")
        setSegmentationResult(null)
        setSelectedFoods({})

        const formData = new FormData()
        formData.append("image", imageFile)

        try {
            const response = await fetch("/api/logmeal/segmentation", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Failed to analyze image")
                return
            }

            setSegmentationResult(data)

            const newMealName = data.occasion ? String(data.occasion).charAt(0).toUpperCase() + String(data.occasion).slice(1) : "Photo meal"
            setMealName(newMealName)

            setSelectedFoods(getDefaultSelectedFoods(data))

        } catch (error) {
            setError("An error occurred while analyzing the image")
        } finally {
            setAnalyzing(false)
        }
    }

    function resetPhoto() {
        setImageFile(null)
        setPreviewUrl(null)
        setSegmentationResult(null)
        setSelectedFoods({})
        setError("")
        setNutritionItems([])
        setMealName("")
        setDate(new Date())
        setUploadFile(null)
        setAnalyzing(false)
        setConfirming(false)
    }

    function handleRemoveDetectedFood(position: number) {
        setSelectedFoods((prev) => {
            const updated = { ...prev }
            delete updated[position]
            return updated
        })
    }

    async function handleConfirmFoods() {
        if (!segmentationResult) return

        setConfirming(true)
        setError("")

        try {
            // LogMeal numbers segments from 1, while our local map is keyed from 0
            // sorting here keeps the confirm payload aligned with the original image order
            const selectedEntries = Object.entries(selectedFoods).sort(([a], [b]) => Number(a) - Number(b))

            const confirmResponse = await fetch("/api/logmeal/confirm-dish", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    imageId: segmentationResult.imageId,
                    confirmedClass: selectedEntries.map(([, food]) => food.id),
                    source: selectedEntries.map(() => "logmeal"),
                    food_item_position: selectedEntries.map(([segmentIndex]) => Number(segmentIndex) + 1),
                }),
            })

            const confirmData = await confirmResponse.json()

            if (!confirmResponse.ok) {
                setError(confirmData.error || "Failed to confirm foods")
                return
            }

            const nutritionResponse = await fetch("/api/logmeal/nutritional-info", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    imageId: segmentationResult.imageId
                }),
            })

            const nutritionData = await nutritionResponse.json()

            if (!nutritionResponse.ok) {
                console.error(nutritionData)
                setError(nutritionData.error || "Failed to retrieve nutrition information")
                return
            }

            setNutritionItems(buildPhotoNutritionItems(nutritionData, selectedFoods))

        } catch (error) {
            console.error("Error confirming foods:", error)
            setError("An error occurred while confirming the foods")
        } finally {
            setConfirming(false)
        }
    }

    async function handleSavePhotoMeal() {
        if (nutritionItems.length === 0) return

        if (!mealName.trim()) {
            setError("Please enter a meal name")
            return
        }

        if (!date) {
            setError("Please select a date and time")
            return
        }

        setConfirming(true)
        setError("")

        const totalEnergy = nutritionItems.reduce((total, item) => total + adjustedKcal(item), 0)

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setError("You must be logged in to save the meal")
            setConfirming(false)
            return
        }

        let imageUrl: string | null = null
        if (uploadFile) {
            imageUrl = await uploadMealImage(supabase, uploadFile, user.id)
        }

        const { data: meal, error: mealError } = await supabase
            .from("diary_entries")
            .insert([
                {
                    user_id: user.id,
                    meal_name: mealName || "Photo meal",
                    entry_type: "photo",
                    total_energy_kcal: totalEnergy,
                    logged_at: date.toISOString(),
                    image_url: imageUrl,
                },
            ])
            .select("id")
            .single()

        if (mealError || !meal) {
            setError("Failed to save meal: " + mealError.message)
            setConfirming(false)
            return
        }

        const itemsToInsert = nutritionItems.map((item) => ({
            diary_entry_id: meal.id,
            logmeal_id: String(item.logmeal_id),
            name: item.name,
            amount: item.serving,
            unit: item.unit,
            energy_kcal: adjustedKcal(item),
        }))

        const { error: itemsError } = await supabase
            .from("diary_items")
            .insert(itemsToInsert)

        if (itemsError) {
            setError("Failed to save meal items: " + itemsError.message)
            setConfirming(false)
            return
        }

        setConfirming(false)
        router.push("/diary")
        router.refresh()
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

    return (
        <section className="space-y-4 pb-24">
            <div>
                <h2 className="text-2xl font-bold">Photo meal</h2>
                <p className="text-muted-foreground">
                    Take or upload a meal photo and confirm the detected foods.
                </p>
            </div>

            <PhotoUploadCard
                previewUrl={previewUrl}
                loading={analyzing}
                error={error}
                onImageChange={handleImageChange}
                onAnalyzeImage={handleAnalyzeImage}
                onResetPhoto={resetPhoto}
                disableAnalyze={!!segmentationResult}
                segmentationResult={segmentationResult}
                selectedFoods={selectedFoods}
            />

            {segmentationResult && nutritionItems.length === 0 && (
                <DetectedFoodsCard
                    result={segmentationResult}
                    selectedFoods={selectedFoods}
                    setSelectedFoods={setSelectedFoods}
                    onRemoveFood={handleRemoveDetectedFood}
                    onConfirmFoods={handleConfirmFoods}
                    loading={confirming}
                />
            )}

            {nutritionItems.length > 0 && (
                <MealDetailsCard
                    mealName={mealName}
                    setMealName={setMealName}
                    date={date}
                    openCalendar={openCalendar}
                    setOpenCalendar={setOpenCalendar}
                    onSelectDate={handleSelectedDate}
                    onSelectTime={handleSelectedTime}
                />
            )}

            {nutritionItems.length > 0 && (
                <PhotoServingReviewCard
                    items={nutritionItems}
                    setItems={setNutritionItems}
                    onSave={handleSavePhotoMeal}
                    onCancel={resetPhoto}
                    loading={confirming}
                />
            )}
        </section>
    )
}