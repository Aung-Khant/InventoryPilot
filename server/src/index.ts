import 'dotenv/config'
import express from "express"
import cors from "cors"
import { prisma } from "./lib/prisma"
import { requireAuth } from "./middleware/requireAuth"
import { requireBusinessAccess } from "./middleware/requireBusinessAccess"
import { requireAdmin } from "./middleware/requireAdmin"

const app = express()
const PORT = process.env.PORT || 5001
const baseRoute = "/api/v1/businesses/:businessSlug"

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.post("/api/v1/businesses", async (req, res) => {
  const { name, slug } = req.body

  const business = await prisma.business.create({
    data: {
      name,
      slug,
    },
  })

  res.json(business)
})

// app.get(`${baseRoute}/ingredients`, async (req, res) => {
//   const { businessSlug } = req.params

//   const business = await prisma.business.findUnique({
//     where: { slug: businessSlug },
//   })

//   if (!business) {
//     return res.status(404).json({ error: "Business not found" })
//   }

//   const ingredients = await prisma.ingredient.findMany({
//     where: { businessId: business.id },
//   })

//   res.json(ingredients)
// })

app.get(
  `${baseRoute}/ingredients`,
  requireAuth,
  requireBusinessAccess,
  async (req, res) => {
    const ingredients = await prisma.ingredient.findMany({
      where: { businessId: req.business!.id },
    })

    res.json(ingredients)
  }
)
app.post(
  `${baseRoute}/ingredients`,
  requireAuth,
  requireBusinessAccess,
  requireAdmin,
  async (req, res) => {
    const { name } = req.body

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        businessId: req.business!.id,
      },
    })

    res.json(ingredient)
  }
)
app.get('/api/v1/me', requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.user,
  })
})
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
