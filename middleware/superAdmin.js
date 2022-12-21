function superAdmin(req, res, next) {
  if (!req.user.isSuperAdmin) return res.status(403).send("Acess denied.");

  next();
}

module.exports = superAdmin;
