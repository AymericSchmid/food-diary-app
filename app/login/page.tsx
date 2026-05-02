"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        setLoading(false)

        if (error) {
            setError(error.message)
            return
        }

        router.push("/diary")
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">Log in</h1>
                    <p className="text-gray-600">Welcome back to your food diary</p>
                </div>

                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                >
                    {loading ? "Logging in..." : "Log in"}
                </Button>

                <p className="text-center text-sm">
                    No account?{" "}
                    <Link href="/signup" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </main>
    )
}
