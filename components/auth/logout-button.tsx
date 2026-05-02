"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type Props = {
    className?: string
}

export default function LogoutButton({ className }: Props) {
    const router = useRouter()
    const supabase = createClient()

    async function handleLogout() {
            await supabase.auth.signOut()
            router.push("/login")
            router.refresh()
    }

    return (
        <Button
            type="button"
            variant="outline"
            className={className}
            onClick={handleLogout}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
        </Button>
    )
}