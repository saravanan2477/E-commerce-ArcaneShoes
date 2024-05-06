// admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.session && req.session.admin) {
      next();
  } else {
      res.redirect('/admin/adminlogin');
  }
};

// auth middleware
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.admin) {
      next();
  } else {
      res.redirect('/admin/adminlogin');
  }
};

// check session middleware
const checkSession = (req, res, next) => {
  console.log("Reached the checkSession");
  if (req.session && req.session.admin) {
      console.log("Session found");
      next();
  } else {
      console.log("No session found");
      res.redirect("/admin/adminlogin");
  }
};

module.exports = { adminMiddleware, authMiddleware, checkSession };
