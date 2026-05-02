import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import BottomNav from "@/components/layout/bottom-nav"

export default async function ProtectedLayout({
    children
}: {    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <main className="min-h-dvh bg-muted">
            <div className="mx-auto flex min-h-dvh max-w-sm flex-col bg-background">
                <header className="border-b p-4">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Welcome back</p>
                            <Link href="/diary" className="text-2xl font-bold tracking-tight">
                                <span className="bg-primary">My</span>Diary
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 pb-28">
                    {children}
                </div>

                <BottomNav />
            </div>
        </main>
    )
}