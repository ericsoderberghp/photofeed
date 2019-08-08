
const manifest = {
  "short_name": "Photo Feed",
  "name": "Photo Feed",
  "icons": [
    {
      "src": "shortcut-icon.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "mobile-app-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#591A0C",
  "background_color": "#06B8B3"
};

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.manifest = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  if (req.method === 'GET') {
    // take /?startUrl=<url> and return a manifest file
    // with `star_url`, same with name
    if (req.query.startUrl) {
      res.json({
        ...manifest,
        short_name: req.query.name || manifest.short_name,
        name: req.query.name ? `${req.query.name} Photo Feed` : manifest.name,
        start_url: req.query.startUrl,
      });
    } else {
      res.json(manifest);
    }
  }

  res.status(405).send();
};
