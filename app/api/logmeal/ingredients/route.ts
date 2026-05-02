import { getLogMealErrorMessage } from "@/components/logmeal/error"
import { NextResponse } from "next/server"

const LOGMEAL_INGREDIENTS_URL = "https://api.logmeal.com/v2/dataset/ingredients"

export async function GET() {
    const token = process.env.LOGMEAL_API_TOKEN

    try {
        const response = await fetch(LOGMEAL_INGREDIENTS_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: {
                // cache the ingredients for 24h
                revalidate: 60 * 60 * 24,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            const errorMessage = getLogMealErrorMessage(response.status, data)
            return NextResponse.json({ error: errorMessage.message, details: data }, { status: response.status })
        }

        return NextResponse.json(data)

    } catch (error) {
        return NextResponse.json(
            {
                error: "Unexpected error while fetching ingredients",
            },
            { status: 500 }
        )
    }
}