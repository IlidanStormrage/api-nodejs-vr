"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Modelo de Comment
const CommentSchema = Schema({
  content: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: "User" }, // Para luego Popular(Relaciona) a User
});

const Comment = mongoose.model("Comment", CommentSchema);

// Modelo de Topic
const TopicSchema = Schema({
  title: String,
  content: String,
  code: String,
  lang: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: "User" }, // Para luego Popular(Relaciona) a User
  comments: [CommentSchema], // Si se deja vacio [ ] no se podra manipular los documentos // CommentSchema = subdocumentos en comments
});

module.exports = mongoose.model("Topic", TopicSchema);
