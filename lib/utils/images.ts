// lib/utils/images.ts

export async function resizeImage(file: File, maxSizeBytes = 1_000_000, maxWidth = 1024, maxHeight = 1024): Promise<File> {
    const image = await loadImageFromFile(file)

    const width = image.naturalWidth
    const height = image.naturalHeight

    if (!width || !height) {
        throw new Error("Could not read image dimensions")
    }

    const scale = Math.min(maxWidth / width, maxHeight / height, 1)

    let targetWidth = Math.round(width * scale)
    let targetHeight = Math.round(height * scale)

    let quality = 0.85
    let blob: Blob | null = null

    while (true) {
        blob = await drawImageToJpegBlob(image, targetWidth, targetHeight, quality)

        if (blob.size <= maxSizeBytes) {
            break
        }

        if (quality > 0.45) {
            quality -= 0.1
        } else {
            targetWidth = Math.round(targetWidth * 0.85)
            targetHeight = Math.round(targetHeight * 0.85)
        }

        if (targetWidth < 400 || targetHeight < 400) {
            throw new Error("Image is still too large after compression")
        }
    }

    return new File([blob], "meal.jpg", {
        type: "image/jpeg",
    })
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
        URL.revokeObjectURL(imageUrl)
        resolve(image)
    }

    image.onerror = () => {
        URL.revokeObjectURL(imageUrl)
        reject(new Error("Could not load this image. Try taking the photo as JPEG or selecting another image."))
    }

    image.src = imageUrl
  })
}

function drawImageToJpegBlob(
    image: HTMLImageElement,
    width: number,
    height: number,
    quality: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")

        if (!ctx) {
            reject(new Error("Could not create image canvas"))
            return
        }

        ctx.drawImage(image, 0, 0, width, height)

        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Could not convert image to JPEG"))
                return
            }
            resolve(blob)
        },
        "image/jpeg",
        quality
        )
    })
}