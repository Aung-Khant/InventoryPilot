import "dotenv/config"

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"

import cors from "cors"
import { Prisma } from "@prisma/client"

import { prisma } from "./lib/prisma"
import { requireAuth } from "./middleware/requireAuth"
import { requireBusinessAccess } from "./middleware/requireBusinessAccess"
import { requireAdmin } from "./middleware/requireAdmin"

const app = express()

const PORT = process.env.PORT || 5001

const baseRoute =
  "/api/v1/businesses/:businessSlug"

app.use(cors())
app.use(express.json())

/*
 * Health check
 */
app.get("/api/health", (_req, res) => {
  return res.json({
    status: "ok",
  })
})

/*
 * Sync the authenticated Supabase user
 * into our local Prisma User table.
 */
app.post(
  "/auth/sync",
  requireAuth,
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authenticatedUser = req.user

      if (!authenticatedUser) {
        return res.status(401).json({
          error:
            "Authenticated user was not found",
        })
      }

      if (!authenticatedUser.email) {
        return res.status(400).json({
          error:
            "The authenticated account does not have an email address",
        })
      }

      const user = await prisma.user.upsert({
        where: {
          id: authenticatedUser.id,
        },

        update: {
          email: authenticatedUser.email,
        },

        create: {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
        },
      })

      return res.json({
        user,
      })
    } catch (error) {
      next(error)
    }
  }
)

/*
 * Task 5
 *
 * Create a new business and create
 * the first OWNER membership in one transaction.
 */
app.post(
  "/api/v1/businesses",
  requireAuth,
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authenticatedUser = req.user

      if (!authenticatedUser) {
        return res.status(401).json({
          error:
            "Authenticated user was not found",
        })
      }

      const name =
        typeof req.body?.name === "string"
          ? req.body.name.trim()
          : ""

      const slug =
        typeof req.body?.slug === "string"
          ? req.body.slug
              .trim()
              .toLowerCase()
          : ""

      if (!name) {
        return res.status(400).json({
          error:
            "Business name is required",
        })
      }

      if (name.length > 100) {
        return res.status(400).json({
          error:
            "Business name must not exceed 100 characters",
        })
      }

      if (!slug) {
        return res.status(400).json({
          error:
            "Business slug is required",
        })
      }

      if (slug.length > 63) {
        return res.status(400).json({
          error:
            "Business slug must not exceed 63 characters",
        })
      }

      const validSlugPattern =
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/

      if (!validSlugPattern.test(slug)) {
        return res.status(400).json({
          error:
            "Business slug may contain only lowercase letters, numbers, and single hyphens",
        })
      }

      const result =
        await prisma.$transaction(
          async (transaction) => {
            const localUser =
              await transaction.user.findUnique({
                where: {
                  id: authenticatedUser.id,
                },
              })

            if (!localUser) {
              throw new Error(
                "LOCAL_USER_NOT_FOUND"
              )
            }

            const business =
              await transaction.business.create({
                data: {
                  name,
                  slug,
                },
              })

            const membership =
              await transaction.businessUser.create({
                data: {
                  businessId: business.id,
                  userId:
                    authenticatedUser.id,
                  role: "OWNER",
                },
              })

            return {
              business,
              membership,
            }
          }
        )

      return res.status(201).json(result)
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(409).json({
          error:
            "That business slug is already taken",
        })
      }

      if (
        error instanceof Error &&
        error.message ===
          "LOCAL_USER_NOT_FOUND"
      ) {
        return res.status(409).json({
          error:
            "Your account is not synchronized with the application. Please restart registration.",
        })
      }

      next(error)
    }
  }
)

/*
 * Task 6
 *
 * Return all businesses the current
 * authenticated user belongs to.
 */

/*
 * Auth test endpoint
 */
app.get(
  "/api/v1/me",
  requireAuth,
  (req, res) => {
    return res.json({
      ok: true,
      user: req.user,
    })
  }
)

/*
 * Get ingredients for a business.
 */
app.get(
  `${baseRoute}/ingredients`,
  requireAuth,
  requireBusinessAccess,
  async (req, res, next) => {
    try {
      const ingredients =
        await prisma.ingredient.findMany({
          where: {
            businessId:
              req.business!.id,
          },
        })

      return res.json(ingredients)
    } catch (error) {
      next(error)
    }
  }
)

/*
 * Create ingredient.
 *
 * OWNER and MANAGER access is
 * checked by requireAdmin.
 */
app.post(
  `${baseRoute}/ingredients`,
  requireAuth,
  requireBusinessAccess,
  requireAdmin,
  async (req, res, next) => {
    try {
      const name =
        typeof req.body?.name ===
        "string"
          ? req.body.name.trim()
          : ""

      const unit =
        typeof req.body?.unit ===
        "string"
          ? req.body.unit.trim()
          : ""

      if (!name || !unit) {
        return res.status(400).json({
          error:
            "Ingredient name and unit are required",
        })
      }

      const ingredient =
        await prisma.ingredient.create({
          data: {
            name,
            unit,
            businessId:
              req.business!.id,
          },
        })

      return res
        .status(201)
        .json(ingredient)
    } catch (error) {
      next(error)
    }
  }
)
app.get(
  "/api/v1/businesses/mine",
  requireAuth,
  async (req, res, next) => {
    try {
      const authenticatedUser = req.user

      if (!authenticatedUser) {
        return res.status(401).json({
          error: "Authenticated user was not found",
        })
      }

      const memberships = await prisma.businessUser.findMany({
        where: {
          userId: authenticatedUser.id,
        },
        include: {
          business: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      const businesses = memberships.map((membership) => ({
        id: membership.business.id,
        name: membership.business.name,
        slug: membership.business.slug,
        role: membership.role,
      }))

      return res.json({
        businesses,
      })
    } catch (error) {
      next(error)
    }
  }
)
/*
 * Central error handler.
 *
 * This must come after the routes.
 */
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(error)

    return res.status(500).json({
      error:
        "Internal server error",
    })
  }
)

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  )
})