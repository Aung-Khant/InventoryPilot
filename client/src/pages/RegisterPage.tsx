import { useState } from "react"
import { supabase } from "../lib/supabase"

type CreateBusinessResponse = {
  business: {
    id: string
    name: string
    slug: string
  }
  membership: {
    id: string
    businessId: string
    userId: string
    role: "OWNER" | "MANAGER" | "STAFF"
  }
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [businessName, setBusinessName] = useState("")
  const [businessSlug, setBusinessSlug] = useState("")
  const [slugWasEdited, setSlugWasEdited] = useState(false)

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function getErrorMessage(
    response: Response,
    fallbackMessage: string
  ): Promise<string> {
    try {
      const data = (await response.json()) as {
        error?: string
      }

      return data.error || fallbackMessage
    } catch {
      return fallbackMessage
    }
  }

  async function handleSignup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError("")

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError("Email is required")
      return
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        })

      if (signupError) {
        setError(signupError.message)
        return
      }

      const token = data.session?.access_token

      if (!token) {
        setError(
          "Signup succeeded, but no session was returned. Check the Supabase email confirmation setting."
        )
        return
      }

      const syncResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!syncResponse.ok) {
        setError(
          await getErrorMessage(
            syncResponse,
            "Failed to sync user with backend"
          )
        )
        return
      }

      setAccessToken(token)
      setStep(2)
    } catch (requestError) {
      console.error(requestError)
      setError(
        "Could not reach the backend. Confirm that the server is running."
      )
    } finally {
      setLoading(false)
    }
  }

  function handleBusinessNameChange(value: string) {
    setBusinessName(value)

    if (!slugWasEdited) {
      setBusinessSlug(normalizeSlug(value))
    }
  }

  function handleBusinessSlugChange(value: string) {
    setSlugWasEdited(true)
    setBusinessSlug(normalizeSlug(value))
  }

  async function handleCreateBusiness(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError("")

    const normalizedName = businessName.trim()
    const normalizedSlug = normalizeSlug(businessSlug)

    if (!normalizedName) {
      setError("Business name is required")
      return
    }

    if (!normalizedSlug) {
      setError("Business slug is required")
      return
    }

    if (!accessToken) {
      setError(
        "Missing access token. Please restart registration."
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/businesses`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: normalizedName,
            slug: normalizedSlug,
          }),
        }
      )

      if (!response.ok) {
        setError(
          await getErrorMessage(
            response,
            "Failed to create business"
          )
        )
        return
      }

      const data =
        (await response.json()) as CreateBusinessResponse

      console.log("Create business response:", data)
      console.log(
        "Redirecting to:",
        `/${data.business.slug}/inventory`
      )

      window.location.assign(
        `/${encodeURIComponent(data.business.slug)}/inventory`
      )
    } catch (requestError) {
      console.error(requestError)
      setError(
        "Could not reach the backend while creating the business."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          Create account
        </h1>

        <p className="mb-6 text-gray-600">
          Step {step} of 2
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded bg-red-100 p-3 text-red-700"
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <form
            onSubmit={handleSignup}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                className="w-full border rounded p-2"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </div>

            <div>
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                className="w-full border rounded p-2"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white rounded p-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={handleCreateBusiness}
            className="space-y-4"
          >
            <div>
              <label htmlFor="business-name">
                Business name
              </label>

              <input
                id="business-name"
                className="w-full border rounded p-2"
                required
                maxLength={100}
                value={businessName}
                onChange={(event) =>
                  handleBusinessNameChange(
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label htmlFor="business-slug">
                Business slug
              </label>

              <input
                id="business-slug"
                className="w-full border rounded p-2"
                required
                maxLength={63}
                value={businessSlug}
                onChange={(event) =>
                  handleBusinessSlugChange(
                    event.target.value
                  )
                }
                placeholder="my-restaurant"
              />

              <p className="mt-1 text-sm text-gray-500">
                Your inventory URL will be /
                {businessSlug || "my-restaurant"}/inventory
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white rounded p-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading
                ? "Creating business..."
                : "Finish registration"}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}