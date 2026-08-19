import { Navigate, useParams } from "react-router"
import { useBusinesses } from "../context/BusinessContext"

export function InventoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { businesses } = useBusinesses()

  if (!slug) {
    return <Navigate to="/login" replace />
  }

  const currentBusiness = businesses.find(
    (business) => business.slug === slug
  )

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Inventory</h1>

        {currentBusiness ? (
          <div className="mt-6 rounded-lg border p-6">
            <p className="text-gray-600">Business</p>

            <h2 className="mt-1 text-2xl font-semibold">
              {currentBusiness.name}
            </h2>

            <dl className="mt-4 space-y-2">
              <div>
                <dt className="font-medium">Slug</dt>
                <dd>{currentBusiness.slug}</dd>
              </div>

              <div>
                <dt className="font-medium">Your role</dt>
                <dd>{currentBusiness.role}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="mt-6 rounded bg-yellow-100 p-4 text-yellow-800">
            This business is not currently loaded in context.
          </div>
        )}
      </div>
    </main>
  )
}