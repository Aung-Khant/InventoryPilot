import type {
  Request,
  Response,
  NextFunction,
} from "express"
import { BusinessRole } from "@prisma/client"

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.businessRole) {
    return res.status(500).json({
      error:
        "Business role is missing. requireBusinessAccess must run before requireAdmin.",
    })
  }

  const hasAdminAccess =
    req.businessRole === BusinessRole.OWNER ||
    req.businessRole === BusinessRole.MANAGER

  if (!hasAdminAccess) {
    return res.status(403).json({
      error: "Owner or manager access is required",
    })
  }

  next()
}