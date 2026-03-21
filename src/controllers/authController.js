const path = require('path');
const clientIndexPath = path.join(__dirname, '..', '..', 'dist', 'client', 'index.html');

function renderLoginPage(req, res) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/');
  }

  return res.sendFile(clientIndexPath);
}

function authFailed(req, res) {
  return res.redirect('/login?error=google_auth_failed');
}

function authSuccess(req, res) {
  return res.redirect('/');
}

function getSession(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  return res.json({ user: req.user || null });
}

function logout(req, res, next) {
  req.logout(err => {
    if (err) {
      return next(err);
    }

    req.session.destroy(sessionErr => {
      if (sessionErr) {
        return next(sessionErr);
      }

      res.clearCookie('music.sid');
      return res.redirect('/login');
    });
  });
}

module.exports = {
  renderLoginPage,
  authFailed,
  authSuccess,
  getSession,
  logout
};
