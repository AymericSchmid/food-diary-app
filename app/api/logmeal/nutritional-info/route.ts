import { getLogMealErrorMessage } from "@/components/logmeal/error"
import { NextResponse } from "next/server"

const LOGMEAL_NUTRITIONAL_INFO_URL = "https://api.logmeal.com/v2/nutrition/recipe/nutritionalInfo"

export async function POST(request: Request) {
    const token = process.env.LOGMEAL_API_TOKEN

    try {
        const body = await request.json()

        const response = await fetch(LOGMEAL_NUTRITIONAL_INFO_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            const errorMessage = getLogMealErrorMessage(response.status, data)
            return NextResponse.json({ error: errorMessage.message, details: data }, { status: response.status })
        }   

        return NextResponse.json(data)
    } catch (error) {
        console.error("Error getting nutritional info:", error)
        return NextResponse.json({ error: "An error occurred while retrieving nutritional information" }, { status: 500 })
    }
}