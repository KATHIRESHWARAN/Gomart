const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  const isAdminEmail = (req.user.email && process.env.ADMIN_EMAIL &&
    req.user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());

  if (req.user.role === 'admin' || isAdminEmail) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden. Administrator privileges required.'
  });
};

module.exports = {
  requireAdmin
};
