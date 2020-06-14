const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlacklistSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  token: {
    type: String,
  },
});

module.exports = mongoose.model("Blacklist", BlacklistSchema);
