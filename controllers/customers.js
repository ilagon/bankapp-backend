const mongoose = require("mongoose");

const Customer = require("../models/customer");
const User = require("../models/user");

exports.customers_get_all = (req, res, next) => {
  Customer.find()
    .populate("user", ["name", "email", "account_status"])
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        customer: docs.map((doc) => {
          return {
            _id: doc._id,
            creditcard_status: doc.creditcard_status,
            creditcard_limit: doc.creditcard_limit,
            balance: doc.balance,
            user: doc.user,
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.customer_create = (req, res, next) => {
  User.findById(req.body.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      const customer = new Customer({
        _id: mongoose.Types.ObjectId(),
        creditcard_status: req.body.creditcard_status,
        creditcard_limit: req.body.creditcard_limit,
        balance: req.body.balance,
        user: req.body.userId,
      });
      return customer.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Customer stored",
        createdCust: {
          _id: result._id,
          creditcard_status: result.creditcard_status,
          creditcard_limit: result.creditcard_limit,
          balance: result.balance,
          user: result.user,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.customer_get_by_id = (req, res, next) => {
  Customer.findById(req.params.customerId)
    .populate("user")
    .exec()
    .then((customer) => {
      if (!customer) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }
      res.status(200).json({
        customer: customer,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.update_creditcard = (req, res, next) => {
  const id = req.params.customerId;
  Customer.update(
    { _id: id },
    {
      $set: {
        creditcard_status: req.body.creditcard_status,
        balance: req.body.balance,
        creditcard_limit: req.body.creditcard_limit,
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

/*exports.customers_get_pending_cc = (req, res) => {
  Customer.find({ creditcard_status: "Pending" }, (err, Customer) => {
    if (err) {
      res.send(err);
    } else {
      res.json(Customer);
    }
  }).populate("user");
};*/

exports.customers_get_pending_cc = (req, res) => {
  Customer.find({ creditcard_status: "Pending" })
  .populate("user")
  .exec()
  .then((customer) => {
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
        });
      }
      res.status(200).json({
        customer: customer,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
  };
