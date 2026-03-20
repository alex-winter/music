function isApiRequest(req) {
  return req.path.startsWith('/search') ||
    req.path.startsWith('/artist/') ||
    req.path.startsWith('/album/') ||
    req.path.startsWith('/downloads') ||
    req.path.startsWith('/download-') ||
    req.path.startsWith('/media/');
}

function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  if (isApiRequest(req)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  return res.redirect('/login');
}

module.exports = requireAuth;
