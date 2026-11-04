const jwt = require('jsonwebtoken');

// Token dibaca dari cookie "token" (atau header Authorization: Bearer ...)
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = req.cookies?.token || (header.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) return res.status(401).json({ message: 'Belum login atau sesi habis' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Belum login atau sesi habis' });
  }
};
