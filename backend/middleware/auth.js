/**
 * Authentication and Authorization Middlewares
 */

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized: Access denied' });
}

function isAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized: Please log in first' });
  }
  
  if (req.user.role === 'admin') {
    return next();
  }
  
  res.status(403).json({ error: 'Forbidden: Admin access required' });
}

module.exports = {
  isAuthenticated,
  isAdmin
};
