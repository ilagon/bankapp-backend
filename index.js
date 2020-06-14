const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/users");
const customerRoutes = require("./routes/customers");

const app = express();
const PORT = 9000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.dbConnection,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//the routes
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);

//handling errors if the routes above don't work
app.use((req, res, next) => {
  const error = new Error("Not Found");
  //set error property of 404
  error.status = 404;
  next(error);
});

//this will handle errors from everywhere else in the application
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

//The port we're working on
app.get("/api/", (req, res) =>
  res.send(`Our application is running on port ${PORT}`)
);
app.listen(PORT, () => console.log(`Your server is running on port ${PORT}`));

module.exports = app;
