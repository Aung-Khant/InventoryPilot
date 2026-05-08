import { BusinessRole } from "@prisma/client"
import { z } from "zod"
import 'dotenv/config'
import express from "express"
import cors from "cors"
import { prisma } from "./lib/prisma"
import { requireAuth } from "./middleware/requireAuth"
import ingredientRoutes from "./routes/ingredientRoutes"
import { errorHandler } from "./middleware/errorHandler"
const app = express()
const PORT = process.env.PORT || 5001
const baseRoute = "/api/v1/businesses/:businessSlug"

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

const createBusinessSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
})

app.post("/api/v1/businesses", requireAuth, async (req, res, next) => {
  try {
    const parsedBody = createBusinessSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return res.status(400).json({
        error: "Invalid request body",
        issues: parsedBody.error.flatten().fieldErrors,
      })
    }

    const userEmail = req.user!.email ?? `${req.user!.id}@unknown.local`

    await prisma.user.upsert({
      where: {
        id: req.user!.id,
      },
      update: {
        email: userEmail,
      },
      create: {
        id: req.user!.id,
        email: userEmail,
      },
    })

    const business = await prisma.business.create({
      data: {
        name: parsedBody.data.name,
        slug: parsedBody.data.slug,
        users: {
          create: {
            userId: req.user!.id,
            role: BusinessRole.OWNER
          },
        },
      },
    })

    res.status(201).json(business)
  } catch (error) {
    next(error)
  }
})

app.get("/api/v1/businesses/mine", requireAuth, async (req, res, next) => {
  try {
    const memberships = await prisma.businessUser.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        business: true,
      },
    })

    res.json(
      memberships.map((membership) => ({
        role: membership.role,
        business: membership.business,
      }))
    )
  } catch (error) {
    next(error)
  }
})

app.use(`${baseRoute}/ingredients`, ingredientRoutes)
app.get('/api/v1/me', requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.user,
  })
})

app.use(errorHandler)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
