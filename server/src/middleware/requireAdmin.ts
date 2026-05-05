import type { Request, Response, NextFunction } from "express"
import { BusinessRole } from "@prisma/client"

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.businessRole) {
    return res.status(500).json({
      error: "Business role missing. Did you forget requireBusinessAccess?",
    })
  }

  if (req.businessRole !== BusinessRole.ADMIN) {
    return res.status(403).json({
      error: "Admin access required",
    })
  }

  next()
}