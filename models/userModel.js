const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  username: {
     type: String,
     trim: true,
     lowercase: true,
     index: true,
  },
  email: {
     type: String,
     require: true,
     trim: true,
     unique: true,
     lowercase: true,
  },
  hash_password: {
     type: String,
     require: true,
  },
  role: {
     type: String,
     enum: ["user", "admin"],
     default: "user",
  },
  contactNumber: {
     type: String,
  },
},{ timestamps: true });

userSchema.method({
  async authenticate(password) {
     return bcrypt.compare(password, this.hash_password);
  },
});
module.exports = mongoose.model("User", userSchema);