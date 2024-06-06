const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserCollection = require("../model/users");
const dotenv=require('dotenv')


dotenv.config()


// Function to generate a referral code
const generateReferralCode = (length) => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  UserCollection.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/redirect",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile._json);

      UserCollection.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          console.log("user is" + currentUser);
          done(null, currentUser);
        } else {
          console.log("not found the user");

          // Generate a referral code for the new user
          const referralCode = generateReferralCode(8);

          new UserCollection({
            username: profile.displayName,
            googleId: profile.id,
            email: profile.emails[0].value,
            referralcode: referralCode,  // Save the referral code
          })
            .save()
            .then((newUser) => {
              console.log("new user created" + newUser);
              done(null, newUser);
            });
        }
      });
    }
  )
);
