// Simple Basic Auth middleware using ADMIN_USER and ADMIN_PASS from .env
// It checks the Authorization header for Basic auth and rejects if missing/invalid.

function parseBasicAuth(header) {
  if (!header || typeof header !== 'string') return null;
  const [type, credentials] = header.split(' ');
  if (type !== 'Basic' || !credentials) return null;
  const decoded = Buffer.from(credentials, 'base64').toString('utf8');
  const sepIndex = decoded.indexOf(':');
  if (sepIndex < 0) return null;
  return {
    username: decoded.slice(0, sepIndex),
    password: decoded.slice(sepIndex + 1),
  };
}

module.exports = function authMiddleware(req, res, next) {
  const credentials = parseBasicAuth(req.headers.authorization);

  if (!credentials) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { username, password } = credentials;
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;

  if (!expectedUser || !expectedPass) {
    return res.status(500).json({ message: 'Server is not configured for authentication' });
  }

  if (username === expectedUser && password === expectedPass) {
    return next();
  }

  return res.status(401).json({ message: 'Invalid credentials' });
};
