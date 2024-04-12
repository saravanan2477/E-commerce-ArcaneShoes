
// admin middeleware
const Admin = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};


// authMiddleware.js

const authMiddleware = (req, res, next) => {
  if (req.session.admin) {
      next();
  } else {
      res.redirect('/admin/login');
  }
};



module.exports = { authMiddleware,Admin };
