
// admin middeleware
const Admin = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin/adminlogin');
    }
};


// authMiddleware.js

const authMiddleware = (req, res, next) => {
  if (req.session.admin) {
      next();
  } else {
      res.redirect('/admin/adminlogin');
  }
};



module.exports = { authMiddleware,Admin };
