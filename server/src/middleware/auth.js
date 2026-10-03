import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'previa_xr_hackathon_super_secret_jwt_token_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Access denied. Authentication token required.',
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({
      error: true,
      message: 'Invalid or expired authentication token.',
    });
  }
}

// Optional auth: if token present, decodes it; otherwise lets request pass with guest user
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  next();
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
