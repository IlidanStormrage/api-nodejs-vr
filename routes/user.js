"use strict";

const express = require("express");
const { probando } = require("../controllers/user");
const UserController = require("../controllers/user");

const router = express.Router();

router.get("/probando", UserController.probando);
router.post("/testeando", UserController.testeando);

module.exports = router;
