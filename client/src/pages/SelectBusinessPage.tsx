import { Navigate, useNavigate } from "react-router"
import { useBusinesses } from "../context/BusinessContext"

export function SelectBusinessPage() {
  const navigate = useNavigate()
  const { businesses } = useBusinesses()

  if (businesses.length === 0) {
    return <Navigate to="/create-business" replace />
  }

  if (businesses.length === 1) {
    return (
      <Navigate
        to={`/${encodeURIComponent(
          businesses[0].slug
        )}/inventory`}
        replace
      />
    )
  }

  function selectBusiness(slug: string) {
    navigate(
      `/${encodeURIComponent(slug)}/inventory`
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold">
          Select a business
        </h1>

        <p className="mt-2 text-gray-600">
          Choose the business you want to manage.
        </p>

        <div className="mt-6 space-y-3">
          {businesses.map((business) => (
            <button
              key={business.id}
              type="button"
              onClick={() =>
                selectBusiness(business.slug)
              }
              className="w-full rounded-lg border p-4 text-left hover:bg-gray-50"
            >
              <div className="font-semibold">
                {business.name}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                /{business.slug}/inventory
              </div>

              <div className="mt-2 text-sm">
                Role: {business.role}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}