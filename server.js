const mongoose = require('mongoose');
const dotenv=require('dotenv')
dotenv.config()
// Mongoose connection
mongoose.connect("mongodb+srv://saravanank24680:5W4Govdp6I3oUfmC@arcanesteps.x2cvb46.mongodb.net/SKS?retryWrites=true&w=majority&appName=arcanesteps")
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });