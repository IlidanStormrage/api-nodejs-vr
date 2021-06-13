"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  image: String,
  role: String,
});

module.export = mongoose.model("User", userSchema);
// lowercase y pluralizar el nombre den a la bases de datos y no USER sino usuarios
