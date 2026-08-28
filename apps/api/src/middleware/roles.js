export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const currentRole = String(req.user.role || '').toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(role => String(role).toUpperCase());
    if (!normalizedAllowedRoles.includes(currentRole)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
};
