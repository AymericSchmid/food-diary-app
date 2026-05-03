export function getLogMealErrorMessage(status: number, data: any) {
    const apiMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        data?.details.message

    if (status === 401 || status === 403) {
        return {
            code: "LOGMEAL_ACCESS_DENIED",
            message: "LogMeal API access is unavailable.",
            technicalMessage: apiMessage,
        }
    }

    console.log("LogMeal API error:", { status, data })

    if (status === 429) {
        return {
            code: "LOGMEAL_RATE_LIMIT",
            message: "LogMeal API rate limit exceeded. Please try again later.",
            technicalMessage: apiMessage,
        }
    }
    
    if (status === 413) {
        return {
            code: "IMAGE_TOO_LARGE",
            message: "The uploaded image exceeds the maximum allowed size.",
            technicalMessage: apiMessage,
        }
    }

    if (status >= 500) {
        return {
            code: "LOGMEAL_SERVER_ERROR",
            message: "LogMeal API is currently unavailable. Please try again later.",
            technicalMessage: apiMessage,
        }
    }

    return {
        code: "LOGMEAL_UNKNOWN_ERROR",
        message: "An unknown error occurred.",
        technicalMessage: apiMessage,
    }
}