import { NextResponse } from "next/server";
import { getLogMealErrorMessage } from "@/components/logmeal/error"

const LOGMEAL_SEGMENTATION_URL = "https://api.logmeal.com/v2/image/segmentation/complete"

export async function POST(request: Request) {
    const token = process.env.LOGMEAL_API_TOKEN

    try {
        // the browser sends the raw file to this route; the server forwards it so the API token never leaves the backend.
        const inputFormData = await request.formData()
        const image = inputFormData.get("image")

        if (!image || !(image instanceof File)) {
            return NextResponse.json({ error: "Invalid image file" }, { status: 400 })
        }

        const formData = new FormData()
        formData.append("image", image)

        const response = await fetch(LOGMEAL_SEGMENTATION_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
            const errorMessage = getLogMealErrorMessage(response.status, data)
            return NextResponse.json({ error: errorMessage.message, details: data }, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Segmentation error:", error)
        return NextResponse.json({ error: "Error while analyzing image" }, { status: 500 })
    }
}