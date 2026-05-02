import ProfileForm from "@/components/profile/profile-form"
import { createClient } from "@/lib/supabase/server"

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user }, } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from("profiles")
        .select(
            `
            user_id,
            age,
            sex,
            weight_kg,
            height_cm,
            goal,
            dietary_preference,
            activity_level
        `
        )
        .eq("user_id", user?.id)
        .maybeSingle()

    return (
        <ProfileForm
            userId={user!.id}
            email={user?.email ?? ""}
            initialProfile={profile}
        />
    )
}