"use client"

import { useMemo, useState } from "react"
import { addDays, format, isSameDay, isToday, startOfDay } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

type DiaryItem = {
    id: string
    name: string
    amount: number | null
    unit: string | null
    energy_kcal: number | null
}

type Meal = {
    id: string
    meal_name: string
    entry_type: "manual" | "photo"
    total_energy_kcal: number
    logged_at: string
    image_url: string | null
    diary_items: DiaryItem[]
}

type Props = {
    meals: Meal[]
}

function formatKcal(value: number | null | undefined) {
    return `${Number(value ?? 0).toFixed(0)} kcal`
}

function formatAmount(value: number | null | undefined) {
    return Number(value ?? 0).toFixed(1)
}

export default function DiaryDayView({ meals }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
    const [calendarOpen, setCalendarOpen] = useState(false)

    const mealsForSelectedDate = useMemo(() => {
        return meals.filter(meal => isSameDay(new Date(meal.logged_at), selectedDate))
    }, [meals, selectedDate])

    const dayTotal = mealsForSelectedDate.reduce((total, meal) => total + (meal.total_energy_kcal ?? 0), 0)

    function goToPreviousDay() {
        setSelectedDate(prev => addDays(prev, -1))
    }

    function goToNextDay() {
        setSelectedDate(prev => addDays(prev, 1))
    }

    return (
        <section className="space-y-4">
            <div>
                <p className="text-muted-foreground">
                    Track your meals and daily energy intake.
                </p>
            </div>

            <Card className="bg-muted/40">
                <CardContent className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    {isToday(selectedDate) ? "Today" : format(selectedDate, "MMM d")}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0" align="center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                    if (!date) return
                                    setSelectedDate(startOfDay(date))
                                    setCalendarOpen(false)
                                    }}
                                    defaultMonth={selectedDate}
                                />
                            </PopoverContent>
                        </Popover>

                        <Button variant="ghost" size="icon" onClick={goToNextDay}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-primary-foreground">
                            {format(selectedDate, "EEEE, MMMM d")}
                        </p>
                        <p className="mt-1 text-4xl font-bold">{formatKcal(dayTotal)}</p>
                        <p className="text-sm text-muted-foreground">
                            {mealsForSelectedDate.length} meal
                            {mealsForSelectedDate.length !== 1 ? "s" : ""} logged
                        </p>
                    </div>
                </CardContent>
            </Card>

            {mealsForSelectedDate.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="font-medium">No meals for this day</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {mealsForSelectedDate.map(meal => (
                        <Card key={meal.id} className="overflow-hidden border-border bg-card text-card-foreground shadow-sm pt-0">
                            <CardHeader
                                className={
                                meal.image_url
                                    ? "relative overflow-hidden border-b pb-3 pt-20 text-white"
                                    : "border-b bg-muted/40 pb-3 pt-5"
                                }
                            >
                                {meal.image_url && (
                                    <>
                                        <img
                                            src={meal.image_url}
                                            alt=""
                                            aria-hidden="true"
                                            className="absolute inset-0 h-full w-full scale-110 object-cover blur-[2px]"
                                        />

                                        <div className="absolute inset-0 bg-foreground/20" />
                                    </>
                                )}

                                <div className="relative z-10 space-y-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">
                                                {meal.meal_name}
                                            </CardTitle>

                                            <p
                                                className={
                                                meal.image_url
                                                    ? "text-xs text-white/80"
                                                    : "text-xs text-muted-foreground"
                                                }
                                            >
                                                {meal.entry_type === "photo" ? "Photo meal" : "Manual meal"}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold">
                                                {Number(meal.total_energy_kcal).toFixed(0)} kcal
                                            </p>

                                            <p
                                                className={
                                                meal.image_url
                                                    ? "text-xs text-white/80"
                                                    : "text-xs text-muted-foreground"
                                                }
                                            >
                                                {new Date(meal.logged_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {meal.diary_items?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {meal.diary_items.map((item, index) => (
                                            <li key={item.id}>
                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-muted-foreground">
                                                            {formatAmount(item.amount)} {item.unit}
                                                        </p>
                                                    </div>

                                                    <span className="text-muted-foreground">
                                                        {formatKcal(item.energy_kcal)}
                                                    </span>
                                                </div>

                                                {index < meal.diary_items.length - 1 && (
                                                <Separator className="mt-2" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No items for this meal.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

        </section>
    )
}