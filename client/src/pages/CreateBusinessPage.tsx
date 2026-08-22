import { useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { supabase } from "../lib/supabase"
import {
  useBusinesses,
  type Business,
} from "../context/BusinessContext"

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
    role: Business["role"]
  }
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function CreateBusinessPage() {
  const navigate = useNavigate()
  const { businesses, setBusinesses } =
    useBusinesses()

  const [businessName, setBusinessName] =
    useState("")

  const [businessSlug, setBusinessSlug] =
    useState("")

  const [slugWasEdited, setSlugWasEdited] =
    useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (businesses.length > 0) {
    return (
      <Navigate
        to={
          businesses.length === 1
            ? `/${encodeURIComponent(
                businesses[0].slug
              )}/inventory`
            : "/select-business"
        }
        replace
      />
    )
  }

  function handleBusinessNameChange(
    value: string
  ) {
    setBusinessName(value)

    if (!slugWasEdited) {
      setBusinessSlug(normalizeSlug(value))
    }
  }

  function handleBusinessSlugChange(
    value: string
  ) {
    setSlugWasEdited(true)
    setBusinessSlug(normalizeSlug(value))
  }

  async function getErrorMessage(
    response: Response,
    fallback: string
  ): Promise<string> {
    try {
      const data = (await response.json()) as {
        error?: string
      }

      return data.error || fallback
    } catch {
      return fallback
    }
  }

  async function handleCreateBusiness(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError("")

    const name = businessName.trim()
    const slug = normalizeSlug(businessSlug)

    if (!name) {
      setError("Business name is required")
      return
    }

    if (!slug) {
      setError("Business slug is required")
      return
    }

    setLoading(true)

    try {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        setError(sessionError.message)
        return
      }

      const token =
        sessionData.session?.access_token

      if (!token) {
        navigate("/login")
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/businesses`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
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

      const newBusiness: Business = {
        id: data.business.id,
        name: data.business.name,
        slug: data.business.slug,
        role: data.membership.role,
      }

      setBusinesses([newBusiness])

      navigate(
        `/${encodeURIComponent(
          newBusiness.slug
        )}/inventory`
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
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border p-6">
        <h1 className="text-2xl font-bold">
          Create your business
        </h1>

        <p className="mt-2 text-gray-600">
          Set up a business before continuing to
          inventory.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded bg-red-100 p-3 text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreateBusiness}
          className="mt-6 space-y-4"
        >
          <div>
            <label htmlFor="new-business-name">
              Business name
            </label>

            <input
              id="new-business-name"
              required
              maxLength={100}
              className="w-full rounded border p-2"
              value={businessName}
              onChange={(event) =>
                handleBusinessNameChange(
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label htmlFor="new-business-slug">
              Business slug
            </label>

            <input
              id="new-business-slug"
              required
              maxLength={63}
              className="w-full rounded border p-2"
              value={businessSlug}
              onChange={(event) =>
                handleBusinessSlugChange(
                  event.target.value
                )
              }
              placeholder="my-business"
            />

            <p className="mt-1 text-sm text-gray-500">
              Your inventory URL will be /
              {businessSlug || "my-business"}
              /inventory
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black p-2 text-white disabled:opacity-60"
          >
            {loading
              ? "Creating business..."
              : "Create business"}
          </button>
        </form>
      </div>
    </main>
  )
}