const mongoose = require('mongoose');

// Mongoose connection
mongoose.connect('mongodb://127.0.0.1:27017/SKS')
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });