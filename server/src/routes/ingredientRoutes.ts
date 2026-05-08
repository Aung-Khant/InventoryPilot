import { Router } from "express"
import { prisma } from "../lib/prisma"
import { requireAuth } from "../middleware/requireAuth"
import { requireBusinessAccess } from "../middleware/requireBusinessAccess"
import { requireAdmin } from "../middleware/requireAdmin"
import { z } from "zod"

const router = Router({ mergeParams: true })

const createIngredientSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    unit: z.string().trim().min(1, "Unit is required"),
    minStock: z.number().nonnegative().optional(),
})

const updateIngredientSchema = z.object({
    name: z.string().trim().min(1, "Name is required").optional(),
    unit: z.string().trim().min(1, "Unit is required").optional(),
    minStock: z.number().nonnegative().nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})

// GET all ingredients for a business
router.get(
    "/",
    requireAuth,
    requireBusinessAccess,
    async (req, res, next) => {
        try {
            const ingredients = await prisma.ingredient.findMany({
                where: {
                    businessId: req.business!.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
            })

            res.json(ingredients)
        } catch (error) {
            next(error)
        }
    }
)

// GET one ingredient
router.get(
    "/:ingredientId",
    requireAuth,
    requireBusinessAccess,
    async (req, res, next) => {
        try {
            const { ingredientId } = req.params
            if (!ingredientId || typeof ingredientId !== "string") {
                return res.status(400).json({ error: "Missing ingredient id" })
            }
            const ingredient = await prisma.ingredient.findFirst({
                where: {
                    id: ingredientId,
                    businessId: req.business!.id,
                },
            })

            if (!ingredient) {
                return res.status(404).json({ error: "Ingredient not found" })
            }

            res.json(ingredient)
        } catch (error) {
            next(error)
        }
    }
)

// CREATE ingredient — admin only
router.post(
    "/",
    requireAuth,
    requireBusinessAccess,
    requireAdmin,
    async (req, res, next) => {
        try {
            const parsedBody = createIngredientSchema.safeParse(req.body)

            if (!parsedBody.success) {
                return res.status(400).json({
                    error: "Invalid request body",
                    issues: parsedBody.error.flatten().fieldErrors,
                })
            }

            const ingredient = await prisma.ingredient.create({
                data: {
                    name: parsedBody.data.name,
                    unit: parsedBody.data.unit,
                    minStock: parsedBody.data.minStock,
                    business: {
                        connect: {
                            id: req.business!.id,
                        },
                    },
                }
            })

            res.status(201).json(ingredient)
        } catch (error) {
            next(error)
        }
    }
)

// UPDATE ingredient — admin only
router.patch(
    "/:ingredientId",
    requireAuth,
    requireBusinessAccess,
    requireAdmin,
    async (req, res, next) => {
        try {
            const { ingredientId } = req.params
            if (!ingredientId || typeof ingredientId !== "string") {
                return res.status(400).json({ error: "Missing ingredient id" })
            }
            const parsedBody = updateIngredientSchema.safeParse(req.body)

            if (!parsedBody.success) {
                return res.status(400).json({
                    error: "Invalid request body",
                    issues: parsedBody.error.flatten().fieldErrors,
                })
            }

            const existingIngredient = await prisma.ingredient.findFirst({
                where: {
                    id: ingredientId,
                    businessId: req.business!.id,
                },
            })

            if (!existingIngredient) {
                return res.status(404).json({ error: "Ingredient not found" })
            }

            const updatedIngredient = await prisma.ingredient.update({
                where: {
                    id: ingredientId,
                },
                data: {
                    ...parsedBody.data,
                },
            })

            res.json(updatedIngredient)
        } catch (error) {
            next(error)
        }
    }
)

// DELETE ingredient — admin only
router.delete(
    "/:ingredientId",
    requireAuth,
    requireBusinessAccess,
    requireAdmin,
    async (req, res, next) => {
        try {
            const { ingredientId } = req.params
            if (!ingredientId || typeof ingredientId !== "string") {
                return res.status(400).json({ error: "Missing ingredient id" })
            }
            const existingIngredient = await prisma.ingredient.findFirst({
                where: {
                    id: ingredientId,
                    businessId: req.business!.id,
                },
            })

            if (!existingIngredient) {
                return res.status(404).json({ error: "Ingredient not found" })
            }

            await prisma.ingredient.delete({
                where: {
                    id: ingredientId,
                },
            })

            res.status(204).send()
        } catch (error) {
            next(error)
        }
    }
)

export default router
