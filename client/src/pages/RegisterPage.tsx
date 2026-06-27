import { useState } from "react"
import { supabase } from "../lib/supabase"

export function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [businessName, setBusinessName] = useState("")
  const [businessSlug, setBusinessSlug] = useState("")

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      const token = data.session?.access_token

      if (!token) {
        setError("Signup worked, but no session was returned. Check email confirmation settings.")
        return
      }

      const syncResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!syncResponse.ok) {
        setError("Failed to sync user with backend")
        return
      }

      setAccessToken(token)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateBusiness(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!accessToken) {
        setError("Missing access token. Please sign up again.")
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/businesses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: businessName,
          slug: businessSlug,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create business")
        return
      }

      alert("Registration complete!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Create account</h1>
        <p className="mb-6 text-gray-600">Step {step} of 2</p>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label>Email</label>
              <input
                className="w-full border rounded p-2"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label>Password</label>
              <input
                className="w-full border rounded p-2"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button className="w-full bg-black text-white rounded p-2" disabled={loading}>
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCreateBusiness} className="space-y-4">
            <div>
              <label>Business name</label>
              <input
                className="w-full border rounded p-2"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />
            </div>

            <div>
              <label>Business slug</label>
              <input
                className="w-full border rounded p-2"
                value={businessSlug}
                onChange={(event) => setBusinessSlug(event.target.value)}
                placeholder="my-restaurant"
              />
            </div>

            <button className="w-full bg-black text-white rounded p-2" disabled={loading}>
              {loading ? "Creating business..." : "Finish registration"}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}