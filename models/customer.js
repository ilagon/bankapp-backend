const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  balance: {
    type: Number,
    default: 0.0,
  },
  creditcard_status: {
    type: String,
    enum: ["Pending", "Active", "Inactive"],
    default: "null",
  },
  creditcard_limit: {
    type: Number,
    default: 0.0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
