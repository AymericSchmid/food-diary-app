import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LogoutButton from "@/components/auth/logout-button"

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
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto flex min-h-screen max-w-sm flex-col bg-white">
                <header className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">My Diary</h1>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>

                        <LogoutButton/>
                    </div>
                </header>

                <div className="flex-1 p-4 pb-24">
                    {children}
                </div>

                <nav className="fixed bottom-0 left-1/2 grid w-full max-w-sm -translate-x-1/2 grid-cols-4 border-t bg-white">
                    <Link href="/diary" className="p-3 text-center text-sm">
                        Diary
                    </Link>
                    <Link href="/log/photo" className="p-3 text-center text-sm">
                        Photo
                    </Link>
                    <Link href="/log/manual" className="p-3 text-center text-sm">
                        Manual
                    </Link>
                    <Link href="/profile" className="p-3 text-center text-sm">
                        Profile
                    </Link>
                </nav>
            </div>
        </main>
    )
}