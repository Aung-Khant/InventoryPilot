import { useState } from "react"
import { useNavigate } from "react-router"
import { supabase } from "../lib/supabase"
import {
    useBusinesses,
    type Business,
} from "../context/BusinessContext"

type BusinessesMineResponse = {
    businesses: Business[]
}

export function LoginPage() {
    const navigate = useNavigate()
    const { setBusinesses } = useBusinesses()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function getErrorMessage(
        response: Response,
        fallback: string
    ) {
        try {
            const data = (await response.json()) as {
                error?: string
            }

            return data.error || fallback
        } catch {
            return fallback
        }
    }

    async function handleLogin(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setError("")
        setLoading(true)

        try {
            const normalizedEmail = email.trim()

            if (!normalizedEmail) {
                setError("Email is required")
                return
            }

            if (!password) {
                setError("Password is required")
                return
            }

            const {
                data,
                error: loginError,
            } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            })

            if (loginError) {
                setError(loginError.message)
                return
            }

            const token = data.session?.access_token

            if (!token) {
                setError(
                    "Login succeeded, but no access token was returned."
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
                        "Failed to synchronize account"
                    )
                )
                return
            }

            const businessesResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/v1/businesses/mine`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!businessesResponse.ok) {
                const message = await getErrorMessage(
                    businessesResponse,
                    "Failed to load businesses"
                )

                console.error("Businesses request failed:", {
                    status: businessesResponse.status,
                    statusText: businessesResponse.statusText,
                    message,
                })

                setError(
                    `${message} (${businessesResponse.status})`
                )

                return
            }

            const dataFromApi =
                (await businessesResponse.json()) as BusinessesMineResponse

            setBusinesses(dataFromApi.businesses)

            if (dataFromApi.businesses.length === 0) {
                navigate("/create-business")
                return
            }

            if (dataFromApi.businesses.length > 1) {
                navigate("/select-business")
                return
            }

            const onlyBusiness = dataFromApi.businesses[0]

            navigate(
                `/${encodeURIComponent(onlyBusiness.slug)}/inventory`
            )
        } catch (requestError) {
            console.error(requestError)

            setError(
                "Login could not reach the server. Confirm that the backend is running."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md border rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-2">
                    Log in
                </h1>

                <p className="mb-6 text-gray-600">
                    Sign in to your InventoryPilot account
                </p>

                {error && (
                    <div
                        role="alert"
                        className="mb-4 rounded bg-red-100 p-3 text-red-700"
                    >
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleLogin}
                    className="space-y-4"
                >
                    <div>
                        <label htmlFor="login-email">
                            Email
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full border rounded p-2"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full border rounded p-2"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white rounded p-2 disabled:opacity-60"
                    >
                        {loading
                            ? "Logging in..."
                            : "Log in"}
                    </button>
                </form>
            </div>
        </main>
    )
}