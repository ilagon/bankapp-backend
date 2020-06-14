const mongoose = require("mongoose");
//for encrypting the passwords and creating tokens
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//lodash can do many things such as manipulate strings/arrays etc
const loadash = require("lodash");
//mailgun send and email to client
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox452c0e1b08574ee5977de0bfcf3a807f.mailgun.org";
const mg = mailgun({
  apiKey: process.env.MAILGUN_APIKEY,
  domain: DOMAIN,
});

const User = require("../models/user");

exports.user_signup = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        //if not false
        //409 means conflict
        //422 unprocessable entity
        return res.status(409).json({
          message: "Email already exists",
        });
      } else {
        //bcrypt function that takes in 1 plain text,
        //2 "salt rounds" -> add random strings to the plain text password before hashing
        //more secured, cause passwords can't be found in dictionary tables
        //3 call back function
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              name: req.body.name,
              account_status: req.body.account_status,
              email: req.body.email,
              password: hash,
              is_admin: req.body.is_admin,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: "User created",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
};

exports.user_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }
      //compare is a method given in bcrypt
      //1 is the plain text user keyed in
      //then the hash is part of the user retrieved
      //3rd is callback get an error or response
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Authentication failed",
          });
        }
        if (result) {
          if (user[0].account_status == "Pending") {
            return res.status(401).json({
              message: "Your account has not been activated!",
            });
          }
          if (user[0].account_status == "Inactive") {
            return res.status(401).json({
              message:
                "Your account has been deactivated! Please email us at premiumbank@support.com to reactivate your account.",
            });
          }
          //to create the token npm install jsonwebtoken
          //find more info here -> https://www.npmjs.com/package/jsonwebtoken
          //1 payload, what to pass to client
          //2 key
          //3rd arg is the option
          //4th callback where you get the token but you can avoid it by assigning it to a constant
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            message: "Autentication successful",
            token: token,
            email: user[0].email,
            userId: user[0]._id,
            is_admin: user[0].is_admin,
            logged_in: user[0].logged_in,
          });
        } else {
          return res.status(401).json({
            message: "Authentication failed",
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_logout = (req, res, next) => {
  //this does not work don't even try HAHA
  //logout from frontend only for now ok :-)
  req.session.destroy();
  res.sendStatus(200);
};

exports.users_get_all = (req, res, next) => {
  User.find()
    .select(
      "name email password account_status reset_password is_admin logged_in _id"
    )
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        Users: docs.map((doc) => {
          return {
            name: doc.name,
            email: doc.email,
            account_status: doc.account_status,
            password: doc.password,
            is_admin: doc.is_admin,
            logged_in: doc.logged_in,
            reset_password: doc.reset_password,
            _id: doc._id,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_get_by_id = (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .select("name email password account_status reset_password is_admin _id")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          user: doc,
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.update_account_status = (req, res, next) => {
  const id = req.params.userId;
  User.updateOne(
    { _id: id },
    {
      $set: {
        account_status: req.body.account_status,
      },
    }
  )
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.get_pending_accounts = (req, res) => {
  User.find({ account_status: "Pending" })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      res.status(200).json({
        user: user,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_delete = (req, res, next) => {
  const id = req.params.userId;
  User.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.forgot_password = (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with this email does not exist",
      });
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_RESET,
      {
        expiresIn: "30m",
      }
    );
    const data = {
      from: "noreply@premiumbank.com",
      to: req.body.email,
      subject: "Reset Password",
      html: `
          <h2> Please paste the security key onto this link: </h2>
          <h3> ${token} </h3>
          <p>http://localhost:9000/reset</p>
      `,
    };

    return user.updateOne({ reset_password: token }, (err, success) => {
      if (err) {
        return res.status(400).json({
          error: "reset password failed",
        });
      } else {
        mg.messages().send(data, function (error, body) {
          if (error) {
            return res.json({
              error: error.message,
            });
          }
          return res.json({
            message:
              "Email has been sent, please check your inbox to reset your password",
          });
        });
      }
    });
  });
};

exports.reset_password = (req, res, next) => {
  const { reset_password, newPassword } = req.body;

  if (reset_password) {
    jwt.verify(reset_password, process.env.JWT_RESET, (error, decodedData) => {
      if (error) {
        return res.status(401).json({
          error: "Invalid token",
        });
      }

      User.findOne({ reset_password }, (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: "User with this token does not exist",
          });
        }

        bcrypt.hash(newPassword, 10, (err, hash) => {
          //create object to store new password
          const obj = {
            password: hash,
          };
          //change the property of this object
          //extend is to update object in db
          user = loadash.extend(user, obj);
          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: "reset password error",
              });
            } else {
              return res.status(200).json({
                message: "Your password has been changed",
              });
            }
          });
        });
      });
    });
  } else {
    return res.status(401).json({
      error: "Authentication failed",
    });
  }
};
