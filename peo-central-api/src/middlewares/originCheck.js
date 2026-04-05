const allowedOrigins = [
  'https://peo-central.nathanhr.ae',
  'https://www.nathanhr.com',
  'https://nathanhr.com'
];

module.exports = function checkOrigin(req, res, next) {
  const origin = req.get('origin') || req.get('referer');

  if (!origin || allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
    return next(); // Allow request
  }

  return res.status(403).json({ message: 'Forbidden: Invalid origin' });
};
