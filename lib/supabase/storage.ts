import { SupabaseClient } from "@supabase/supabase-js"

export async function uploadMealImage(supabase: SupabaseClient, file: File, userId: string) {
    const fileName = `${userId}/${Date.now()}.jpg`
    
    const { error } = await supabase.storage
        .from("meal-images")
        .upload(fileName, file, {
            contentType: "image/jpeg",
            upsert: false,
        })

    if (error) {
        throw new Error(`Failed to upload image: ${error.message}`)
    }

    const { data } = supabase.storage.from("meal-images").getPublicUrl(fileName)

    return data.publicUrl
}