const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  account_status: {
    type: String,
    enum: ["Pending", "Active", "Inactive"],
    default: "Pending",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: String,
    default: false,
  },
  logged_in: {
    type: Boolean,
    default: false,
  },
  reset_password: {
    data: String,
    default: "",
  },
});

module.exports = mongoose.model("User", UserSchema);
