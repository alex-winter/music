const express = require('express');

const requireAuth = require('../middleware/requireAuth');

function createAppRoutes(sendClientApp) {
  const router = express.Router();

  router.use(requireAuth);

  router.get('/', sendClientApp);
  router.get('/downloads', sendClientApp);
  router.get('/ai-playlist', sendClientApp);
  router.get('/artist/:artistId/albums', sendClientApp);
  router.get('/album/:albumId', sendClientApp);

  return router;
}

module.exports = createAppRoutes;
