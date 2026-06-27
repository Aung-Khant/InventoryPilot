import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export async function requireBusinessAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { businessSlug } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!businessSlug || typeof businessSlug !== "string") {
      return res.status(400).json({ error: "Missing business slug" });
    }

    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
    });

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const businessUser = await prisma.businessUser.findUnique({
      where: {
        businessId_userId: {
          businessId: business.id,
          userId: req.user.id,
        },
      },
    });

    if (!businessUser) {
      return res.status(403).json({
        error: "You do not have access to this business",
      });
    }

    req.business = business;
    req.businessRole = businessUser.role;

    next();
  } catch (error) {
    next(error);
  }
}