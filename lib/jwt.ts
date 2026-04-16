import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.AUTH_SECRET || 'fallback_secret_key_joeliaa_77';

export function verifyJWT(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized' };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    return { user: decoded, error: null };
  } catch (err) {
    return { user: null, error: 'Invalid or expired token' };
  }
}

// Wrapper for API Routes
export function withAuth(handler: (req: Request, ...args: any[]) => Promise<NextResponse>) {
  return async (req: Request, ...args: any[]) => {
    const { user, error } = verifyJWT(req);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Attach user to req somehow if needed (we can't easily modify NextRequest, 
    // but we can pass it as another arg if needed. For now, just protecting is enough)
    return handler(req, ...args);
  };
}
