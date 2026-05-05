import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Ensure these are initialized with your Service Role Key for server-side auth
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Missing or invalid Authorization header' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // getUser() validates the JWT against Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired access token' 
      });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ 
      error: 'Internal server error during authentication' 
    });
  }
};