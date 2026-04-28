"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { error } = await supabase.auth.signUp({
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
            <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">Create account</h1>
                    <p className="text-gray-600">Start your food diary</p>
                </div>

                <input 
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-lg border px-4 py-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-lg border px-4 py-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>

                <p className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </main>
    )
}
