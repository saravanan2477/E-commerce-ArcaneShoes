const mongoose = require('mongoose');
const dotenv=require('dotenv')
dotenv.config()
// Mongoose connection
mongoose.connect(process.env.MONGO_ENV)
  .then(() => {
    console.log("MongoDB is connected success");
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });