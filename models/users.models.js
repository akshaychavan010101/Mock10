const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
});

userSchema.pre("save", async function (next) {
  this.password = bcrypt.hashSync(this.password, 5);
  next();
});

const User = mongoose.model("user", userSchema);

module.exports = { User };
