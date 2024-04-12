const User = require ('../model/users')

const checkSessionBlocked = async (req, res, next) => {
    if (req.session.userid ) {
      const userDetials = await User.findOne({ _id: req.session.userid });
      if (!userDetials.isblocked) {
        // User is not blocked, proceed to the next middleware or route handler
        next();
      } else {
        // User is blocked, destroy the session and redirect
        req.session.destroy((err) => {
          if (err) {
            console.log("Error destroying session: ", err);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        });
      }
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/");
    }
  };
  module.exports = checkSessionBlocked;



