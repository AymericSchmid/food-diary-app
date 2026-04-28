import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold">Food Diary</h1>
          <p className="mt-2 text-gray-600">
            Track meals with AI-powered nutrition logging.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full rounded-lg bg-black px-4 py-3 text-white"
          >
            Create account
          </Link>

          <Link
            href="/login"
            className="block w-full rounded-lg border px-4 py-3"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  )
}