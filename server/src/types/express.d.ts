import type { User } from '@supabase/supabase-js'
import type { Business, BusinessRole } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
      business?: Business;
      businessRole?: BusinessRole;
    }
  }
}

export { }