import { createClient } from "@/lib/supabase/server"
import DiaryDayView from "@/components/diary/diary-day-view"

export default async function DiaryPage() {
  const supabase = await createClient()

  // we can select all entries as RLS automatically limites to the current user
  const { data: meals, error } = await supabase
    .from("diary_entries")
    .select(`
      id,
      meal_name,
      entry_type,
      total_energy_kcal,
      logged_at,
      image_url,
      diary_items (
        id,
        name,
        amount,
        unit,
        energy_kcal
      )
    `)
    .order("logged_at", { ascending: false })

  if (error) {
    return (
      <p className="text-sm text-red-600">Could not load diary entries: {error.message}</p>
    )
  }

  return <DiaryDayView meals={meals ?? []} />
}