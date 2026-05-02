"use client"

import { useMemo, useState } from "react"
import { Save, User, Scale, Ruler, Target, Activity } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { calculateBmi, getBmiCategory } from "@/lib/utils/bmi"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import LogoutButton from "../auth/logout-button"

type Profile = {
    user_id: string
    age: number | null
    sex: string | null
    weight_kg: number | null
    height_cm: number | null
    goal: string | null
    dietary_preference: string | null
    activity_level: string | null
}

type Props = {
    userId: string
    email: string
    initialProfile: Profile | null
}

export default function ProfileForm({
    userId,
    email,
    initialProfile,
}: Props) {
    const supabase = createClient()

    const [age, setAge] = useState(initialProfile?.age?.toString() ?? "")
    const [sex, setSex] = useState(initialProfile?.sex ?? "")
    const [weightKg, setWeightKg] = useState(initialProfile?.weight_kg?.toString() ?? "")
    const [heightCm, setHeightCm] = useState(initialProfile?.height_cm?.toString() ?? "")
    const [goal, setGoal] = useState(initialProfile?.goal ?? "")
    const [dietaryPreference, setDietaryPreference] = useState(initialProfile?.dietary_preference ?? "")
    const [activityLevel, setActivityLevel] = useState(initialProfile?.activity_level ?? "")

    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const bmi = useMemo(() => {
        return calculateBmi(Number(weightKg), Number(heightCm))
    }, [weightKg, heightCm])

    const bmiCategory = getBmiCategory(bmi)

    async function handleSaveProfile() {
        setSaving(true)
        setMessage("")
        setError("")

        const payload = {
            user_id: userId,
            age: age ? Number(age) : null,
            sex: sex || null,
            weight_kg: weightKg ? Number(weightKg) : null,
            height_cm: heightCm ? Number(heightCm) : null,
            goal: goal || null,
            dietary_preference: dietaryPreference || null,
            activity_level: activityLevel || null,
        }

        const { error } = await supabase
            .from("profiles")
            .upsert(payload, {
                onConflict: "user_id",
        })

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        setMessage("Profile saved successfully.")
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Profile
                </h2>
                <p className="text-sm text-muted-foreground">
                    Personalize your food diary and calculate your BMI.
                </p>
            </div>

            <Card className="border-border bg-card text-card-foreground shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <User className="h-7 w-7" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <CardTitle>Account</CardTitle>
                            <CardDescription className="truncate">
                                {email}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <LogoutButton className="w-full" />
                </CardContent>
            </Card>

            <Card className="border-border bg-card text-card-foreground shadow-sm">
                <CardHeader>
                    <CardTitle>Body details</CardTitle>
                    <CardDescription>
                        Used to calculate your Body Mass Index.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                type="number"
                                inputMode="numeric"
                                placeholder="28"
                                value={age}
                                onChange={(event) => setAge(event.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Sex</Label>
                            <Select value={sex} onValueChange={setSex}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight</Label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="weight"
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="70"
                                    className="pl-9 pr-10"
                                    value={weightKg}
                                    onChange={(event) => setWeightKg(event.target.value)}
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">kg</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="height">Height</Label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="height"
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="175"
                                    className="pl-9 pr-10"
                                    value={heightCm}
                                    onChange={(event) => setHeightCm(event.target.value)}
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">cm</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Your BMI</p>
                                <p className="text-3xl font-bold tracking-tight">
                                    {bmi ?? "—"}
                                </p>
                            </div>

                            {bmiCategory && (
                                <Badge variant="secondary">{bmiCategory}</Badge>
                            )}
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                            BMI is calculated from your weight and height.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border bg-card text-card-foreground shadow-sm">
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                        Help the diary reflect your nutrition goals.
                    </CardDescription>
                    </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Goal</Label>
                        <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger>
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Choose a goal" />
                            </div>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="weight_loss">Weight loss</SelectItem>
                            <SelectItem value="muscle_gain">Muscle gain</SelectItem>
                            <SelectItem value="being_healthier">Being healthier</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Dietary preference</Label>
                        <Select value={dietaryPreference} onValueChange={setDietaryPreference}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a preference" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="unrestricted">Unrestricted</SelectItem>
                                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                <SelectItem value="vegan">Vegan</SelectItem>
                                <SelectItem value="pescetarian">Pescetarian</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Activity level</Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                            <SelectTrigger>
                                <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Choose activity level" />
                                </div>
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="sedentary">Sedentary</SelectItem>
                                <SelectItem value="lightly_active">Lightly active</SelectItem>
                                <SelectItem value="moderately_active">Moderately active</SelectItem>
                                <SelectItem value="very_active">Very active</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {message && (
                        <p className="text-sm text-primary">{message}</p>
                    )}

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                        size="lg"
                        className="w-full"
                        onClick={handleSaveProfile}
                        disabled={saving}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save profile"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}